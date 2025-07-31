# services/chemical_info_service.py
import asyncio
import aiohttp
from typing import Dict, Any, Optional, List
from fastapi import HTTPException
import urllib.parse

class ChemicalInfoService:
    """Service for fetching chemical information from external databases"""
    
    def __init__(self):
        self.pubchem_base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
        self.cactus_base_url = "https://cactus.nci.nih.gov/chemical/structure"
        self.timeout = 10
    
    async def verify_chemical_availability(self, smiles: str, name: str) -> Dict[str, Any]:
        """
        Verify chemical availability and get comprehensive information
        Returns combined data from multiple sources
        """
        results = {
            "availability_score": 0,  # 0-100 scale
            "sources": [],
            "pubchem_data": None,
            "cactus_data": None,
            "commercial_availability": "unknown",
            "safety_info": {},
            "properties": {}
        }
        
        try:
            # Run searches in parallel for better performance
            pubchem_task = self._get_pubchem_info(smiles, name)
            cactus_task = self._get_cactus_info(smiles)
            
            pubchem_data, cactus_data = await asyncio.gather(
                pubchem_task, cactus_task, return_exceptions=True
            )
            
            # Process PubChem results
            if not isinstance(pubchem_data, Exception) and pubchem_data:
                results["pubchem_data"] = pubchem_data
                results["sources"].append("PubChem")
                results["availability_score"] += 50
                
                # Extract commercial availability info
                if "commercial_sources" in pubchem_data:
                    results["commercial_availability"] = "available"
                    results["availability_score"] += 30
                
                # Extract safety information
                if "safety" in pubchem_data:
                    results["safety_info"] = pubchem_data["safety"]
                
                # Extract properties
                if "properties" in pubchem_data:
                    results["properties"].update(pubchem_data["properties"])
            
            # Process Cactus results
            if not isinstance(cactus_data, Exception) and cactus_data:
                results["cactus_data"] = cactus_data
                results["sources"].append("Cactus")
                results["availability_score"] += 20
                
                # Update properties with Cactus data
                if "properties" in cactus_data:
                    results["properties"].update(cactus_data["properties"])
            
            # Determine final availability status
            if results["availability_score"] >= 70:
                results["commercial_availability"] = "readily_available"
            elif results["availability_score"] >= 40:
                results["commercial_availability"] = "possibly_available"
            else:
                results["commercial_availability"] = "synthesis_required"
            
            return results
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error verifying chemical availability: {str(e)}"
            )
    
    async def _get_pubchem_info(self, smiles: str, name: str) -> Optional[Dict[str, Any]]:
        """Get information from PubChem database"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                # Try SMILES search first
                cid = await self._get_pubchem_cid_by_smiles(session, smiles)
                
                # If SMILES search fails, try name search
                if not cid:
                    cid = await self._get_pubchem_cid_by_name(session, name)
                
                if not cid:
                    return None
                
                # Get compound details
                compound_info = await self._get_pubchem_compound_details(session, cid)
                return compound_info
                
        except Exception as e:
            print(f"PubChem search error: {e}")
            return None
    
    async def _get_pubchem_cid_by_smiles(self, session: aiohttp.ClientSession, smiles: str) -> Optional[str]:
        """Get PubChem CID by SMILES"""
        try:
            url = f"{self.pubchem_base_url}/compound/smiles/{urllib.parse.quote(smiles)}/cids/JSON"
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if "IdentifierList" in data and "CID" in data["IdentifierList"]:
                        return str(data["IdentifierList"]["CID"][0])
        except Exception:
            pass
        return None
    
    async def _get_pubchem_cid_by_name(self, session: aiohttp.ClientSession, name: str) -> Optional[str]:
        """Get PubChem CID by compound name"""
        try:
            url = f"{self.pubchem_base_url}/compound/name/{urllib.parse.quote(name)}/cids/JSON"
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if "IdentifierList" in data and "CID" in data["IdentifierList"]:
                        return str(data["IdentifierList"]["CID"][0])
        except Exception:
            pass
        return None
    
    async def _get_pubchem_compound_details(self, session: aiohttp.ClientSession, cid: str) -> Dict[str, Any]:
        """Get detailed compound information from PubChem"""
        result = {"cid": cid, "properties": {}, "safety": {}}
        
        try:
            # Get basic properties
            props_url = f"{self.pubchem_base_url}/compound/cid/{cid}/property/MolecularWeight,MolecularFormula,InChI,InChIKey,CanonicalSMILES/JSON"
            async with session.get(props_url) as response:
                if response.status == 200:
                    data = await response.json()
                    if "PropertyTable" in data and "Properties" in data["PropertyTable"]:
                        props = data["PropertyTable"]["Properties"][0]
                        result["properties"] = {
                            "molecular_weight": props.get("MolecularWeight"),
                            "molecular_formula": props.get("MolecularFormula"),
                            "inchi": props.get("InChI"),
                            "inchi_key": props.get("InChIKey"),
                            "canonical_smiles": props.get("CanonicalSMILES")
                        }
            
            # Get synonyms and commercial sources
            synonyms_url = f"{self.pubchem_base_url}/compound/cid/{cid}/synonyms/JSON"
            async with session.get(synonyms_url) as response:
                if response.status == 200:
                    data = await response.json()
                    if "InformationList" in data and "Information" in data["InformationList"]:
                        synonyms = data["InformationList"]["Information"][0].get("Synonym", [])
                        result["synonyms"] = synonyms[:10]  # Limit to first 10 synonyms
                        
                        # Check for commercial indicators
                        commercial_indicators = ["sigma", "aldrich", "fisher", "merck", "thermo", "acros", "tci"]
                        for synonym in synonyms:
                            if any(indicator in synonym.lower() for indicator in commercial_indicators):
                                result["commercial_sources"] = True
                                break
            
            return result
            
        except Exception as e:
            print(f"Error getting PubChem compound details: {e}")
            return result
    
    async def _get_cactus_info(self, smiles: str) -> Optional[Dict[str, Any]]:
        """Get information from Cactus database"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                # Get IUPAC name
                iupac_url = f"{self.cactus_base_url}/{urllib.parse.quote(smiles)}/iupac_name"
                
                result = {"properties": {}}
                
                async with session.get(iupac_url) as response:
                    if response.status == 200:
                        iupac_name = await response.text()
                        if iupac_name and "Error" not in iupac_name:
                            result["properties"]["iupac_name"] = iupac_name.strip()
                
                # Get molecular formula
                formula_url = f"{self.cactus_base_url}/{urllib.parse.quote(smiles)}/formula"
                async with session.get(formula_url) as response:
                    if response.status == 200:
                        formula = await response.text()
                        if formula and "Error" not in formula:
                            result["properties"]["molecular_formula_cactus"] = formula.strip()
                
                return result if result["properties"] else None
                
        except Exception as e:
            print(f"Cactus search error: {e}")
            return None
    
    async def search_similar_compounds(self, smiles: str, threshold: float = 0.8) -> List[Dict[str, Any]]:
        """Search for structurally similar compounds that might be more readily available"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
                # Use PubChem similarity search
                url = f"{self.pubchem_base_url}/compound/similarity/smiles/{urllib.parse.quote(smiles)}/JSON"
                params = {"Threshold": int(threshold * 100), "MaxRecords": 10}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "IdentifierList" in data and "CID" in data["IdentifierList"]:
                            similar_compounds = []
                            for cid in data["IdentifierList"]["CID"][:5]:  # Limit to 5 results
                                compound_info = await self._get_pubchem_compound_details(session, str(cid))
                                if compound_info:
                                    similar_compounds.append(compound_info)
                            return similar_compounds
                        
        except Exception as e:
            print(f"Error searching similar compounds: {e}")
        
        return []

# Global chemical info service instance
chemical_info_service = ChemicalInfoService()
#!/usr/bin/env python3
"""
Test script for AI Chemistry Research Assistant improvements
Tests the new features and ensures they work correctly
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_chemical_info_service():
    """Test the chemical information service"""
    print("Testing Chemical Information Service...")
    
    try:
        from services.chemical_info_service import chemical_info_service
        
        # Test with a common compound
        test_smiles = "CCO"  # Ethanol
        test_name = "ethanol"
        
        print(f"   Testing with: {test_name} ({test_smiles})")
        
        # Test availability verification
        availability_info = await chemical_info_service.verify_chemical_availability(test_smiles, test_name)
        
        print(f"   PASS Availability Score: {availability_info['availability_score']}/100")
        print(f"   PASS Commercial Availability: {availability_info['commercial_availability']}")
        print(f"   PASS Sources Found: {', '.join(availability_info['sources'])}")
        
        return True
        
    except Exception as e:
        print(f"   FAIL Error: {str(e)}")
        return False

def test_template_service():
    """Test the template service"""
    print(" Testing Template Service...")
    
    try:
        from services.template_service import template_service
        
        # Check if template is properly structured
        template = template_service.enhanced_proposal_template
        
        required_sections = [
            "Abstract", "Introduction", "Objectives", "Chemical Design", 
            "Methodology", "Expected Outcomes", "Timeline", "Risk Assessment"
        ]
        
        missing_sections = []
        for section in required_sections:
            if section.lower() not in template.lower():
                missing_sections.append(section)
        
        if missing_sections:
            print(f"    Missing sections: {', '.join(missing_sections)}")
            return False
        
        print("    All required sections present")
        print(f"    Template length: {len(template)} characters")
        
        return True
        
    except Exception as e:
        print(f"    Error: {str(e)}")
        return False

def test_history_service():
    """Test the history service"""
    print(" Testing History Service...")
    
    try:
        from services.history_service import history_service
        
        # Test creating a session
        session_id = history_service.create_research_session(
            topic="test synthesis of MOF materials",
            source="semantic",
            api_provider="google",
            papers_analyzed=5
        )
        
        if not session_id:
            print("    Failed to create session")
            return False
        
        print(f"    Created session: {session_id}")
        
        # Test updating session
        success = history_service.update_research_session(
            session_id,
            status="completed",
            summary="Test summary"
        )
        
        if not success:
            print("    Failed to update session")
            return False
        
        print("    Updated session successfully")
        
        # Test retrieving history
        history = history_service.get_research_history(limit=5)
        
        if not isinstance(history, list):
            print("    Failed to retrieve history")
            return False
        
        print(f"    Retrieved {len(history)} history entries")
        
        # Test statistics
        stats = history_service.get_research_statistics()
        
        if not isinstance(stats, dict) or 'total_sessions' not in stats:
            print("    Failed to get statistics")
            return False
        
        print(f"    Statistics: {stats['total_sessions']} total sessions")
        
        return True
        
    except Exception as e:
        print(f"    Error: {str(e)}")
        return False

def test_structure_service():
    """Test enhanced structure service"""
    print(" Testing Enhanced Structure Service...")
    
    try:
        from services.structure_service import structure_service
        
        # Test SMILES validation
        valid_smiles = "CCO"
        invalid_smiles = "invalid_smiles"
        
        if not structure_service.validate_smiles(valid_smiles):
            print(f"    Valid SMILES rejected: {valid_smiles}")
            return False
        
        if structure_service.validate_smiles(invalid_smiles):
            print(f"    Invalid SMILES accepted: {invalid_smiles}")
            return False
        
        print("    SMILES validation working correctly")
        
        # Test properties calculation
        properties = structure_service.get_molecule_properties(valid_smiles)
        
        required_props = ["molecular_weight", "num_atoms", "logp"]
        missing_props = [prop for prop in required_props if prop not in properties]
        
        if missing_props:
            print(f"    Missing properties: {', '.join(missing_props)}")
            return False
        
        print(f"    Properties calculated: MW={properties['molecular_weight']}, Atoms={properties['num_atoms']}")
        
        return True
        
    except Exception as e:
        print(f"    Error: {str(e)}")
        return False

def test_imports():
    """Test all new imports work correctly"""
    print(" Testing Imports...")
    
    modules_to_test = [
        ("services.chemical_info_service", "chemical_info_service"),
        ("services.template_service", "template_service"),
        ("services.history_service", "history_service"),
        ("routers.history", "router"),
    ]
    
    failed_imports = []
    
    for module_name, attribute in modules_to_test:
        try:
            module = __import__(module_name, fromlist=[attribute])
            getattr(module, attribute)
            print(f"    {module_name}")
        except Exception as e:
            print(f"    {module_name}: {str(e)}")
            failed_imports.append(module_name)
    
    return len(failed_imports) == 0

def test_file_structure():
    """Test that all required files exist"""
    print(" Testing File Structure...")
    
    required_files = [
        "services/chemical_info_service.py",
        "services/template_service.py", 
        "services/history_service.py",
        "routers/history.py",
        "requirements.txt"
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"    {file_path}")
    
    if missing_files:
        print(f"    Missing files: {', '.join(missing_files)}")
        return False
    
    return True

async def main():
    """Run all tests"""
    print("AI Chemistry Research Assistant - Testing Improvements")
    print("=" * 60)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Imports", test_imports),
        ("Structure Service", test_structure_service),
        ("Template Service", test_template_service),
        ("History Service", test_history_service),
        ("Chemical Info Service", test_chemical_info_service),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 40)
        
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"    Test failed with exception: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print(" TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = " PASS" if result else " FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n All tests passed! The improvements are ready to use.")
        print("\nKey improvements implemented:")
        print("   Chemical availability verification via PubChem/Cactus APIs")
        print("   Enhanced proposal templates with better structure")
        print("   Search history tracking and analytics")
        print("   Improved proposal preview consistency")
        print("   Chemical design rationale explanations")
    else:
        print(f"\n  {total - passed} test(s) failed. Please check the issues above.")
        return 1
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n Unexpected error: {str(e)}")
        sys.exit(1)
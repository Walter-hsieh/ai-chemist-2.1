#!/usr/bin/env python3
"""
Setup script for AI Chemistry Research Assistant
Run this script to create the proper directory structure and files.
"""

import os
import sys

def create_directory_structure():
    """Create the required directory structure"""
    directories = [
        "models",
        "services", 
        "routers",
        "utils",
        "static",
        "static/css",
        "static/js",
        "static/js/services",
        "static/js/components", 
        "static/js/utils",
        "knowledge_base"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def create_init_files():
    """Create __init__.py files for Python packages"""
    init_files = [
        "models/__init__.py",
        "services/__init__.py", 
        "routers/__init__.py",
        "utils/__init__.py"
    ]
    
    for init_file in init_files:
        with open(init_file, 'w') as f:
            f.write("# Python package init file\n")
        print(f"Created: {init_file}")

def check_requirements():
    """Check if requirements.txt exists"""
    if not os.path.exists("requirements.txt"):
        print("requirements.txt not found!")
        print("Please create requirements.txt with the dependencies listed in the documentation.")
        return False
    print("requirements.txt found")
    return True

def main():
    """Main setup function"""
    print("Setting up AI Chemistry Research Assistant")
    print("=" * 50)
    
    # Create directories
    print("\nCreating directory structure...")
    create_directory_structure()
    
    # Create init files
    print("\nCreating Python package files...")
    create_init_files()
    
    # Check requirements
    print("\nChecking requirements...")
    has_requirements = check_requirements()
    
    print("\n" + "=" * 50)
    print("Setup complete!")
    print("\nNext steps:")
    print("1. Copy the code files from the artifacts into their respective directories")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Get API keys from OpenAI and/or Google")
    print("4. Run the application: python main.py")
    print("5. Open http://localhost:8000 in your browser")
    
    if not has_requirements:
        print("\nDon't forget to create requirements.txt!")

if __name__ == "__main__":
    main()

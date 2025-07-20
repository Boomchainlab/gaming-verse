"""
Check if all required dependencies are installed
"""

def check_dependency(module_name, package_name=None):
    """Check if a module can be imported"""
    if package_name is None:
        package_name = module_name
    
    try:
        __import__(module_name)
        print(f"✅ {package_name} is installed")
        return True
    except ImportError:
        print(f"❌ {package_name} is NOT installed")
        print(f"   Install with: pip install {package_name}")
        return False

def main():
    print("🔍 CHECKING DEPENDENCIES")
    print("=" * 40)
    
    dependencies = [
        ("flask", "Flask"),
        ("web3", "web3"),
        ("eth_account", "eth-account"),
        ("flask_sqlalchemy", "Flask-SQLAlchemy")
    ]
    
    missing = []
    
    for module, package in dependencies:
        if not check_dependency(module, package):
            missing.append(package)
    
    print("\n" + "=" * 40)
    
    if missing:
        print("❌ MISSING DEPENDENCIES:")
        for package in missing:
            print(f"   • {package}")
        print(f"\n📦 Install all at once:")
        print(f"   pip install {' '.join(missing)}")
        print(f"\n🔧 Or run the setup script:")
        print(f"   python setup.py")
    else:
        print("✅ ALL DEPENDENCIES INSTALLED!")
        print("🚀 You can run the game:")
        print("   python simple-app.py")
    
    print("=" * 40)

if __name__ == "__main__":
    main()

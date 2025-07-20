from setuptools import setup, find_packages

setup(
    name='futuristic_game',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        'web3',
        'Flask-SQLAlchemy',
        'eth-account',
        'gunicorn',
        'python-telegram-bot',
        'aiohttp',
        'matplotlib',
        'pandas'
    ],
    entry_points={
        'console_scripts': [
            'run-game=app:app.run',
            'run-webhook=telegram_webhook:app.run',
            'run-analytics=analytics_dashboard:app.run',
            'setup-bot=setup_telegram_bot:main',
            'run-marketing=viral_marketing:main',
        ],
    },
)

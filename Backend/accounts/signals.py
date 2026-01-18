"""
Signals for accounts app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

# Add any signals here if needed in the future
# For example, sending welcome emails, creating profiles, etc.

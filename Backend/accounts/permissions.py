"""
Custom permissions for accounts app
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission check for admin users"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsCustomer(permissions.BasePermission):
    """Permission check for customer users"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'customer'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission for admin to write, others to read"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )

"""
Admin configuration for service app
"""
from django.contrib import admin
from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    """Admin interface for ServiceRequest model"""
    list_display = [
        'id', 'customer', 'vehicle', 'status', 'cost',
        'date', 'scheduled_date', 'assigned_to', 'completed_date'
    ]
    list_filter = ['status', 'date', 'scheduled_date', 'completed_date']
    search_fields = [
        'customer__name', 'customer__email',
        'vehicle__brand', 'vehicle__model', 'description'
    ]
    ordering = ['-date']
    readonly_fields = ['date', 'completed_date']
    
    fieldsets = (
        ('Service Information', {
            'fields': ('customer', 'vehicle', 'description', 'status')
        }),
        ('Pricing & Scheduling', {
            'fields': ('cost', 'scheduled_date', 'assigned_to')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('date', 'completed_date')
        }),
    )

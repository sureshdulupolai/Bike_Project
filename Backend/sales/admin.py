"""
Admin configuration for sales app
"""
from django.contrib import admin
from .models import Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    """Admin interface for Sale model"""
    list_display = [
        'id', 'customer', 'vehicle', 'amount', 'quantity',
        'status', 'date', 'verified_by', 'verified_at'
    ]
    list_filter = ['status', 'date', 'verified_at']
    search_fields = ['customer__name', 'customer__email', 'vehicle__brand', 'vehicle__model']
    ordering = ['-date']
    readonly_fields = ['date', 'verified_at']
    
    fieldsets = (
        ('Sale Information', {
            'fields': ('customer', 'vehicle', 'amount', 'quantity', 'status')
        }),
        ('Verification', {
            'fields': ('verified_by', 'verified_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('date',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make fields readonly based on sale status"""
        if obj and obj.status == 'verified':
            return ['customer', 'vehicle', 'amount', 'quantity', 'date', 'verified_at', 'verified_by']
        return self.readonly_fields

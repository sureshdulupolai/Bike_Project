"""
URLs for reports app
"""
from django.urls import path
from .views import (
    sales_report,
    inventory_report,
    service_report,
    dashboard_summary
)

urlpatterns = [
    path('sales/', sales_report, name='sales-report'),
    path('inventory/', inventory_report, name='inventory-report'),
    path('service/', service_report, name='service-report'),
    path('dashboard/', dashboard_summary, name='dashboard-summary'),
]

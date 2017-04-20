from django.conf.urls import url

from . import views

app_name = 'schedulingcalendar'
urlpatterns = [
    url(r'^$', views.front_page, name='front_page'),
    url(r'^calendar/$', views.calendar_page, name='calendar_page'),
    url(r'^calendar/add_schedule$', views.add_schedule, name='add_schedule'),
    url(r'^calendar/get_schedules$', views.get_schedules, name='get_schedules'),
    url(r'^calendar/get_schedule_info$', views.get_schedule_info, name='get_schedule_info'),
    url(r'^calendar/add_employee_to_schedule$', views.add_employee_to_schedule, name='add_employee_to_schedule'),
    url(r'^calendar/remove_schedule$', views.remove_schedule, name='remove_schedule'),
    url(r'^employees/$', views.employee_page, name='employee_page'),
]
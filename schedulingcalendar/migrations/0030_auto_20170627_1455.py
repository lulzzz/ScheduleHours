# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-06-27 19:55
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('schedulingcalendar', '0029_auto_20170617_1502'),
    ]

    operations = [
        migrations.CreateModel(
            name='LiveCalendar',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='Date')),
                ('version', models.IntegerField(default=1, verbose_name='Version')),
                ('active', models.BooleanField(default=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedulingcalendar.Department')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='LiveSchedule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_datetime', models.DateTimeField(verbose_name='start datetime')),
                ('end_datetime', models.DateTimeField(verbose_name='end datetime')),
                ('hide_start_time', models.BooleanField()),
                ('hide_end_time', models.BooleanField()),
                ('calendar', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedulingcalendar.LiveCalendar')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedulingcalendar.Department')),
            ],
        ),
        migrations.AlterField(
            model_name='employee',
            name='employee_user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='employee', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='liveschedule',
            name='employee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='schedulingcalendar.Employee'),
        ),
        migrations.AddField(
            model_name='liveschedule',
            name='schedule',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='schedulingcalendar.Schedule'),
        ),
        migrations.AddField(
            model_name='liveschedule',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]

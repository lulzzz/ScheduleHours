# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-04-30 15:57
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0067_auto_20180429_1151'),
    ]

    operations = [
        migrations.RenameField(
            model_name='livecalendar',
            old_name='active',
            new_name='all_employee_view',
        ),
    ]

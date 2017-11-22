# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-06 21:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0048_businessdata_sort_by_eligibles'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='businessdata',
            name='sort_by_eligibles',
        ),
        migrations.AddField(
            model_name='businessdata',
            name='sort_by_names',
            field=models.BooleanField(default=False),
        ),
    ]
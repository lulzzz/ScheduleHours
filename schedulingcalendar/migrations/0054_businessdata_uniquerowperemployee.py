# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-01-23 17:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0053_liveschedule_schedule_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessdata',
            name='uniqueRowPerEmployee',
            field=models.BooleanField(default=False),
        ),
    ]
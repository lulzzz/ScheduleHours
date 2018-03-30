# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2018-02-07 18:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0055_auto_20180123_1125'),
    ]

    operations = [
        migrations.AlterField(
            model_name='daynotebody',
            name='body_text',
            field=models.CharField(blank=True, default='', max_length=280, verbose_name='Note'),
        ),
        migrations.AlterField(
            model_name='daynoteheader',
            name='header_text',
            field=models.CharField(blank=True, default='', max_length=140, verbose_name='Note'),
        ),
        migrations.AlterField(
            model_name='liveschedule',
            name='schedule_note',
            field=models.CharField(blank=True, default='', max_length=280),
        ),
        migrations.AlterField(
            model_name='schedule',
            name='schedule_note',
            field=models.CharField(blank=True, default='', max_length=280),
        ),
    ]
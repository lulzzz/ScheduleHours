# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-24 15:35
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedulingcalendar', '0017_auto_20170519_1743'),
    ]

    operations = [
        migrations.AddField(
            model_name='businessdata',
            name='overtime_multiplier',
            field=models.FloatField(default=1.5, verbose_name='Overtime Multiplier'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='businessdata',
            name='overtime',
            field=models.IntegerField(verbose_name='Overtime'),
        ),
    ]

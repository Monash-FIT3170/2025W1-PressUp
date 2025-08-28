import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const RosterItemsCollection = new Mongo.Collection('rosteritems');

RosterItemsCollection.schema = new SimpleSchema({
    // Employee reference
    employee_id: {
        type: String,
        required: true,
        label: 'Employee ID'
    },
    
    // Date and time fields
    date: {
        type: Date,
        required: true,
        label: 'Roster Date'
    },
    
    start_time: {
        type: Date,
        required: true,
        label: 'Shift Start Time'
    },
    
    end_time: {
        type: Date,
        required: true,
        label: 'Shift End Time'
    },
    
    // Shift details
    shift_type: {
        type: String,
        allowedValues: ['Normal', 'Annual Leave', 'Personal Leave', 'Long Service Leave'],
        required: true,
        label: 'Shift Type'
    },
    
    role: {
        type: String,
        required: true,
        label: 'Role for this shift'
    },
    
    // Status
    status: {
        type: String,
        allowedValues: ['unconfirmed', 'confirmed', 'published'],
        defaultValue: 'confirmed',
        label: 'Roster Status'
    },
    
    // Break information
    break_duration: {
        type: Number,
        min: 0,
        max: 480, // 8 hours in minutes
        defaultValue: 0,
        label: 'Break Duration (minutes)'
    },
    
    // Notes
    notes: {
        type: String,
        optional: true,
        max: 500,
        label: 'Additional Notes'
    },
    
    // System fields
    created_at: {
        type: Date,
        defaultValue: new Date(),
        label: 'Created At'
    },
    
    updated_at: {
        type: Date,
        defaultValue: new Date(),
        label: 'Updated At'
    },
    
    created_by: {
        type: String,
        required: true,
        label: 'Created By'
    },
    
    updated_by: {
        type: String,
        optional: true,
        label: 'Updated By'
    }
});

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const RolesCollection = new Mongo.Collection('roles');

RolesCollection.schema = new SimpleSchema({
    // Role name
    name: {
        type: String,
        required: true,
        max: 100,
        label: 'Role Name'
    },
    
    // Role description
    description: {
        type: String,
        optional: true,
        max: 500,
        label: 'Role Description'
    },
    
    // Department this role belongs to
    department_id: {
        type: String,
        optional: true,
        label: 'Department ID'
    },
    
    // Role level/hierarchy
    level: {
        type: Number,
        min: 1,
        max: 10,
        defaultValue: 1,
        label: 'Role Level'
    },
    
    // Hourly rate for this role
    hourly_rate: {
        type: Number,
        min: 0,
        optional: true,
        label: 'Hourly Rate'
    },
    
    // Whether this role is active
    is_active: {
        type: Boolean,
        defaultValue: true,
        label: 'Is Active'
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

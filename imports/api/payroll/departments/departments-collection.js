import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const DepartmentsCollection = new Mongo.Collection('departments');

DepartmentsCollection.schema = new SimpleSchema({
    // Department name
    name: {
        type: String,
        required: true,
        max: 100,
        label: 'Department Name'
    },
    
    // Department code/short name
    code: {
        type: String,
        optional: true,
        max: 10,
        label: 'Department Code'
    },
    
    // Department description
    description: {
        type: String,
        optional: true,
        max: 500,
        label: 'Department Description'
    },
    
    // Parent department (for hierarchical structure)
    parent_department_id: {
        type: String,
        optional: true,
        label: 'Parent Department ID'
    },
    
    // Department manager/head
    manager_id: {
        type: String,
        optional: true,
        label: 'Manager ID'
    },
    
    // Department level in hierarchy
    level: {
        type: Number,
        min: 1,
        max: 10,
        defaultValue: 1,
        label: 'Department Level'
    },
    
    // Department color (for UI display)
    color: {
        type: String,
        optional: true,
        label: 'Department Color'
    },
    
    // Budget information
    budget: {
        type: Number,
        min: 0,
        optional: true,
        label: 'Department Budget'
    },
    
    // Whether this department is active
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

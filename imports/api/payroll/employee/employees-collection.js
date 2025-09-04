import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const EmployeesCollection = new Mongo.Collection('employees');

EmployeesCollection.schema = new SimpleSchema({
    employee_id: {type: Number},
    first_name: {type: String},
    last_name: {type: String},
    dob: {type: Date},
    address: {type: String},
    email: {type: String},
    phone: {type: String},
    start_date: {type: Date},
    employement_type: {type: String},
    roles: { type: Array},
    'roles.$': { type: String },
});
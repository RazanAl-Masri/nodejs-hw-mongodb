import { SORT_ORDER } from '../constants/index.js';
import { Contact } from '../models/contacts.js';

/**
 * Fetch paginated contacts with sorting.
 * @param {Object} params - Query parameters
 * @param {number} params.page - Current page number
 * @param {number} params.perPage - Items per page
 * @param {string} params.sortOrder - Sorting order (asc/desc)
 * @param {string} params.sortBy - Field to sort by
 * @returns {Object} Pagination results including metadata
 */
export const getAllContacts = async ({ page = 1, perPage = 10, sortOrder = SORT_ORDER.ASC, sortBy = '_id' }) => {
    try {
        // Ensure page and perPage are positive integers
        page = Math.max(Number(page) || 1, 1);
        perPage = Math.max(Number(perPage) || 10, 1);

        // Calculate pagination values
        const skip = (page - 1) * perPage;
        const totalItems = await Contact.countDocuments();

        // Fetch paginated contacts with sorting
        const contacts = await Contact.find()
            .sort({ [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1 })
            .skip(skip)
            .limit(perPage);

        return {
            contacts,
            page,
            perPage,
            totalItems,
            totalPages: Math.ceil(totalItems / perPage),
            hasPreviousPage: page > 1,
            hasNextPage: page * perPage < totalItems,
        };
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw new Error('Error retrieving contacts');
    }
};

/**
 * Fetch a single contact by ID.
 * @param {string} id - Contact ID
 * @returns {Object|null} Contact object or null if not found
 */
export const getContactById = async (id) => {
    try {
        const contact = await Contact.findById(id);
        return contact || null;
    } catch (error) {
        console.error(`Error fetching contact with ID ${id}:`, error);
        return null;
    }
};

/**
 * Create a new contact.
 * @param {Object} payload - Contact data
 * @returns {Object} Created contact
 */
export const createContact = async (payload) => {
    try {
        return await Contact.create(payload);
    } catch (error) {
        console.error('Error creating contact:', error);
        throw new Error('Failed to create contact');
    }
};

/**
 * Delete a contact by ID.
 * @param {string} id - Contact ID
 * @returns {Object|null} Deleted contact or null if not found
 */
export const deleteContact = async (id) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        return deletedContact || null;
    } catch (error) {
        console.error(`Error deleting contact with ID ${id}:`, error);
        return null;
    }
};

/**
 * Update or upsert a contact.
 * @param {string} id - Contact ID
 * @param {Object} payload - Contact data to update
 * @param {Object} options - Additional options (e.g., upsert)
 * @returns {Object|null} Updated contact or null if not found
 */
export const updateContact = async (id, payload, options = {}) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(id, payload, {
            new: true,
            upsert: options.upsert || false, // Allow upsert option
        });

        return updatedContact ? { contact: updatedContact, isNew: options.upsert } : null;
    } catch (error) {
        console.error(`Error updating contact with ID ${id}:`, error);
        return null;
    }
};

import { SORT_ORDER } from '../constants/index.js';
import { Contact } from '../models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  try {
    // Convert page and perPage to numbers
    page = Number(page);
    perPage = Number(perPage);
    
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(perPage) || perPage < 1) perPage = 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Count total contacts
    const totalItems = await Contact.countDocuments();

    // Fetch paginated contacts with sorting
    const contacts = await Contact.find()
      .sort({ [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1 })
      .skip(skip)
      .limit(perPage)
      .exec();

    // Calculate pagination metadata
    const paginationData = calculatePaginationData(totalItems, perPage, page);

    console.log('Successfully fetched paginated contacts');

    return {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages: paginationData.totalPages,
      hasPreviousPage: paginationData.hasPreviousPage,
      hasNextPage: paginationData.hasNextPage,
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Error retrieving contacts');
  }
};

export const getContactById = async (id) => {
  try {
    return await Contact.findById(id);
  } catch (error) {
    console.error(`Error fetching contact with ID ${id}:`, error);
    return null;
  }
};

export const createContact = async (payload) => {
  try {
    return await Contact.create(payload);
  } catch (error) {
    console.error('Error creating contact:', error);
    throw new Error('Failed to create contact');
  }
};

export const deleteContact = async (id) => {
  try {
    return await Contact.findByIdAndDelete({ _id: id });
  } catch (error) {
    console.error(`Error deleting contact with ID ${id}:`, error);
    return null;
  }
};

export const updateContact = async (id, payload, options = {}) => {
  try {
    const rawResult = await Contact.findByIdAndUpdate({ _id: id }, payload, {
      new: true,
      includeResultMetadata: true,
      ...options,
    });

    if (!rawResult) return null;

    return {
      contact: rawResult, // Fixed incorrect key from 'student' to 'contact'
      isNew: Boolean(rawResult?.lastErrorObject?.upserted),
    };
  } catch (error) {
    console.error(`Error updating contact with ID ${id}:`, error);
    return null;
  }
};

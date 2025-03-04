import createHttpError from 'http-errors';
import {
  getContactById,
  getAllContacts,
  createContact,
  deleteContact,
  updateContact,
} from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

/**
 * Controller to fetch paginated contacts with sorting
 */
export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortOrder, sortBy } = parseSortParams(req.query);

    // Fetch contacts with pagination and metadata
    const result = await getAllContacts({ page, perPage, sortOrder, sortBy });

    return res.status(200).json({
      status: 200,
      message: 'Successfully fetched contacts!',
      data: {
        contacts: result.contacts, // Contacts list
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasPreviousPage: result.hasPreviousPage,
        hasNextPage: result.hasNextPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch a single contact by ID
 */
export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (!contact) throw createHttpError(404, 'Contact not found!');
    
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with ID: ${contactId}`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to create a new contact
 */
export const createContactController = async (req, res, next) => {
  try {
    const contact = await createContact(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a contact by ID
 */
export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await deleteContact(contactId);
    if (!contact) throw createHttpError(404, 'Contact not found!');
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update (or upsert) a contact
 */
export const upsertContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body, { upsert: true });

    if (!result) throw createHttpError(404, 'Contact not found!');
    
    res.status(result.isNew ? 201 : 200).json({
      status: result.isNew ? 201 : 200,
      message: 'Successfully upserted a contact!',
      data: result.contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to patch (partially update) a contact
 */
export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body);
    if (!result) throw createHttpError(404, 'Contact not found!');
    
    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: result.contact,
    });
  } catch (error) {
    next(error);
  }
};

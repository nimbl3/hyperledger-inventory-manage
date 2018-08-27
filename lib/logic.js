'use strict';

/* global getParticipantRegistry emit */

/**
 * DeliveryItem transaction
 * @param {com.nimbl3.imp.DeliveryItem} deliveryItem, @param {Boolean} status
 * @transaction
 */
async function DeliveryItem(deliveryItem, status) {

  // Update delivering status
  deliveryItem.isDelivered = status;

  // Check if it's delivered
  if (deliveryItem.isDelivered) {
    // Update amount to our current inventory.

    const itemRegistry = await getAssetRegistry('com.nimbl3.imp.Item');
    var specificItem = itemRegistry.get(deliveryItem.item.getIdentifier())
    specificItem.amount = specificItem.amount - deliveryItem.item.amount
    
    await itemRegistry.update(specificItem)
  }
}

/**
 * UsePoints transaction
 * @param {com.nimbl3.imp.AddItem} addItem, @param {Boolean}  status
 * @transaction
 */
async function AddItem(addItem, status) {
  // Update delivering status
  deliveryItem.isDelivered = status;

  // Check if it's delivered
  if (deliveryItem.isDelivered) {
    // Update amount to our current inventory.

    const itemRegistry = await getAssetRegistry('com.nimbl3.imp.Item');
    var specificItem = itemRegistry.get(deliveryItem.item.getIdentifier())
    specificItem.amount = specificItem.amount + deliveryItem.item.amount
    
    await itemRegistry.update(specificItem)
  }
}

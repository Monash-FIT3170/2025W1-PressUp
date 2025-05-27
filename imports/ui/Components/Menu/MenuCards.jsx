import React, { useState, useRef, useCallback } from 'react';
import { Card } from './Card.jsx';
import { MenuItemPopUp } from './MenuItemPopUp.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js";

export const MenuCards = ({ menuItems, selectedCategory, updateMenuItem, setMenuItems, searchTerm }) => {
  const [existingItem, setExistingItem] = useState(false);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const deletionQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  const handleEditClick = (item) => {
    setExistingItem(item);
  };

  // Process deletions one at a time
  const processDeletionQueue = useCallback(async () => {
    if (isProcessingRef.current || deletionQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    console.log('[CLIENT] Starting deletion queue processing');

    while (deletionQueueRef.current.length > 0) {
      const itemId = deletionQueueRef.current[0]; 
      
      try {
        console.log(`[CLIENT] Processing deletion for ${itemId}`);
        
        const result = await new Promise((resolve, reject) => {
          Meteor.call('menu.remove', itemId, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        console.log(`[CLIENT] Successfully deleted ${itemId}:`, result);
        
        deletionQueueRef.current.shift();
        
        if (deletionQueueRef.current.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`[CLIENT] Error deleting ${itemId}:`, error);
        
        deletionQueueRef.current.shift();
        
        Meteor.call("menu.getAll", (err, result) => {
          if (!err) {
            setMenuItems(result);
          }
        });
      }

      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }

    isProcessingRef.current = false;
    console.log('[CLIENT] Deletion queue processing complete');

    Meteor.call("menu.getAll", (error, result) => {
      if (!error) {
        console.log('[CLIENT] Final menu refresh, items:', result.length);
        setMenuItems(result);
      }
    });
  }, [setMenuItems]);

  const deleteMenuItem = useCallback((itemId) => {
    console.log(`[CLIENT] Delete requested for ${itemId}`);
    
    if (deletingItems.has(itemId) || deletionQueueRef.current.includes(itemId)) {
      console.log(`[CLIENT] Item ${itemId} already queued for deletion`);
      return;
    }

    // Mark as deleting
    setDeletingItems(prev => new Set(prev).add(itemId));

    deletionQueueRef.current.push(itemId);
    console.log(`[CLIENT] Added ${itemId} to deletion queue. Queue length:`, deletionQueueRef.current.length);

    setMenuItems((prevItems) => {
      const filtered = prevItems.filter(item => item._id !== itemId);
      console.log(`[CLIENT] UI updated - removed ${itemId}, remaining items:`, filtered.length);
      return filtered;
    });

    // Process the queue
    processDeletionQueue();
  }, [deletingItems, setMenuItems, processDeletionQueue]);

  React.useEffect(() => {
    console.log('[CLIENT] Current menu items in UI:', menuItems.length);
  }, [menuItems]);

  const itemsToDisplay = menuItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.menuCategory?.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatch = !searchTerm || item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="card-container">
      {existingItem && (
        <MenuItemPopUp
          mode='update'
          existingItem={existingItem}
          onClose={() => setExistingItem(false)}
          addMenuItem={updateMenuItem}
        />
      )}
      {console.log(selectedCategory)}
      {itemsToDisplay.length === 0 ? (
        <p>No items matching this search available</p>
      ) : (
        itemsToDisplay.map(item => (
          <Card
            key={item._id}
            title={item.name}
            description={`Price: $${item.price}`}
            onButtonClick={() => handleEditClick(item)}
            onDelete={() => deleteMenuItem(item._id)}
            onEdit={() => handleEditClick(item)}
            disabled={deletingItems.has(item._id)}
            style={{ opacity: deletingItems.has(item._id) ? 0.5 : 1 }}
          />
        ))
      )}
    </div>
  );
};
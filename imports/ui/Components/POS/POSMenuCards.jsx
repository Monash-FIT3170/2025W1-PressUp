import React, { useState, useEffect } from 'react';
import { ItemCard } from './ItemCard.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js"; // Ensure this is imported to use Meteor methods
import moment from 'moment';

export const POSMenuCards = ({ menuItems, selectedCategory, addToOrder }) => {
  const [itemsWithDiscount, setItemsWithDiscount] = useState([]);
  // Function to handle adding an item to the order
  const handleAddToOrder = (item) => {
    addToOrder(item);
  };

  const getIsCurrentlyAvailable = (item) => {
    if (!item.available) return false;
  
    const today = moment().format('dddd');
    const scheduleToday = item.schedule?.[today];
  
    if (!scheduleToday || !scheduleToday.available) return false;
  
    const now = moment();
  
    const { start, end } = scheduleToday;
  
    if (!start && !end) {
      return true;
    }
  
    const startTime = moment(start, 'HH:mm');
    const endTime = moment(end, 'HH:mm');
  
    return now.isBetween(startTime, endTime);
  }; 

  const itemsWithAvailability = menuItems.map(item => ({
    ...item,
    isCurrentlyAvailable: getIsCurrentlyAvailable(item),
  }));

  useEffect(() => {
    if (!menuItems || menuItems.length === 0) {
      setItemsWithDiscount([]);
      return;
    }

    const fetchDiscounts = async () => {
      // Wrap Meteor.call in a Promise
      const getDiscountedPrice = (itemId, category, basePrice) =>
        new Promise((resolve, reject) => {
          Meteor.call('promotions.getDiscountedPrice', itemId, category, basePrice, null, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });

      // Map each menu item to its discounted data
      const updatedItems = await Promise.all(
        menuItems.map(async (item) => {
          try {
            const discountResult = await getDiscountedPrice(item._id, item.menuCategory, item.price);
            return {
              ...item,
              discountedPrice: discountResult.finalPrice,
              discountAmount: discountResult.discount,
              appliedPromotion: discountResult.appliedPromotion,
              isCurrentlyAvailable: getIsCurrentlyAvailable(item),
            };
          } catch (error) {
            // If error, fallback to original price, mark available
            return {
              ...item,
              discountedPrice: item.price,
              discountAmount: 0,
              appliedPromotion: null,
              isCurrentlyAvailable: getIsCurrentlyAvailable(item),
            };
          }
        })
      );

      setItemsWithDiscount(updatedItems);
    };

    fetchDiscounts();
  }, [menuItems]);

  const itemsToRender = (itemsWithDiscount.length > 0 ? itemsWithDiscount : menuItems).map(item => ({
    ...item,
    isCurrentlyAvailable: getIsCurrentlyAvailable(item),
  }));

  const sortedItems = [...itemsToRender].sort((a, b) => {
    return (a.isCurrentlyAvailable === b.isCurrentlyAvailable)
      ? 0
      : a.isCurrentlyAvailable
      ? -1
      : 1;
  });

  return (
    <div className="card-container">
      {sortedItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        sortedItems
          .filter(item => selectedCategory === 'All' || item.menuCategory === selectedCategory)
          .map(item => {
            const isCurrentlyAvailable = getIsCurrentlyAvailable(item);
            return (
              <ItemCard
                key={item._id}
                name={item.name}
                price={item.price}
                discountedPrice={item.discountedPrice}
                available={isCurrentlyAvailable}
                ingredients = {item.ingredients}
              isGlutenFree={item.isGlutenFree}
              isHalal={item.isHalal}
              isVegetarian={item.isVegetarian}
              onAddToOrder={() => handleAddToOrder(item)}
              />
            );
          })
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { ItemCard } from './ItemCard.jsx';
// no Meteor/react-meteor-data imports needed here
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import "/imports/api/menu/menu-methods.js"; // ensures Meteor methods are available
import { MenuItemCollection } from "../../../api/menu/menu-collection.js";
import moment from 'moment';

export const POSMenuCards = ({
  menuItems,
  selectedCategory,
  addToOrder,
  searchTerm = ''
}) => {
  const [itemsWithDiscount, setItemsWithDiscount] = useState([]);
  // add to order handler remains unchanged
  const handleAddToOrder = item => {
    addToOrder(item);
  };

  // Determines if an item is available right now based on its schedule
  const getIsCurrentlyAvailable = item => {
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

  // 1) Filter by category
  const byCategory = menuItems.filter(item =>
    selectedCategory === 'all' ||
    item.menuCategory === selectedCategory
  );

  // 2) Then filter the result by the search term
  const bySearch = byCategory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3) Compute availability for each remaining item
  const itemsWithAvailability = bySearch.map(item => ({
    ...item,
    isCurrentlyAvailable: getIsCurrentlyAvailable(item),
  }));

  useEffect(() => {
    if (!menuItems || menuItems.length === 0) {
      setItemsWithDiscount([]);
      return;
    }

    const fetchDiscounts = async () => {
      const getDiscountedPrice = (itemName, category, basePrice) =>
        new Promise((resolve, reject) => {
          Meteor.call('promotions.getDiscountedPrice', itemName, category, basePrice, null, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });

      // Map each menu item to its discounted data
      const updatedItems = await Promise.all(
        menuItems.map(async (item) => {
          try {
            const discountResult = await getDiscountedPrice(item.name, item.menuCategory, item.price);
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

  // 5) Render cards
  return (
    <div className="card-container">
      {sortedItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        sortedItems
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
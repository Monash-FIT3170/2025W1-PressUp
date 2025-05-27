import React from 'react';
import { ItemCard } from './ItemCard.jsx';
import { Meteor } from 'meteor/meteor';
import "/imports/api/menu/menu-methods.js"; // Ensure this is imported to use Meteor methods
import moment from 'moment';

export const POSMenuCards = ({ menuItems, selectedCategory, addToOrder }) => {
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
  
  const sortedItems = itemsWithAvailability.sort((a, b) => {
    return (a.isCurrentlyAvailable === b.isCurrentlyAvailable)
      ? 0
      : a.isCurrentlyAvailable
      ? -1
      : 1;
  });

  return (
    <div className="card-container">
      {sortedItems === 0 ? (
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
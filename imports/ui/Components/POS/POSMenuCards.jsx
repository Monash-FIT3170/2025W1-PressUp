import React from 'react';
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

  // 4) Sort available items first
  const sortedItems = itemsWithAvailability.sort((a, b) => {
    if (a.isCurrentlyAvailable === b.isCurrentlyAvailable) return 0;
    return a.isCurrentlyAvailable ? -1 : 1;
  });

  // 5) Render cards
  return (
    <div className="card-container">
      {sortedItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        sortedItems.map(item => (
          <ItemCard
            key={item._id}
            name={item.name}
            price={`Price: $${item.price}`}
            available={item.isCurrentlyAvailable}
            ingredients={item.ingredients}
            isGlutenFree={item.isGlutenFree}
            isHalal={item.isHalal}
            isVegetarian={item.isVegetarian}
            onAddToOrder={() => handleAddToOrder(item)}
          />
        ))
      )}
    </div>
  );
};
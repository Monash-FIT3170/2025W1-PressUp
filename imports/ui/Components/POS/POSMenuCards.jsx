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

  // Determines if date is within seasons
  const getInSeason = itemSeasons => {
    //if item available in all seasons it is in season
    if (itemSeasons.length >= 4) return true;

    const date = new Date();
    const month = date.getMonth();
    var season = '';
    if (month < 2 || month == 11) {
      season = 'Summer'
    } else if (month >= 2 && month < 5) {
      season = 'Autumn'
    } else if (month >= 5 && month < 8) {
      season = 'Winter'
    } else {
      season = 'Spring'
    }

    if (itemSeasons.has(season)) {
      return true;
    }
    return false;
   };

  // Determines if an item is available right now based on its schedule
  const getIsCurrentlyAvailable = item => {
    if (!item.available) return false;
    
    itemSeasons = item.seasons || new Set(['Summer','Winter','Autumn','Spring']);

    console.log(itemSeasons)
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

  // 4) fetch discounts
  useEffect(() => {
    if (!itemsWithAvailability || itemsWithAvailability.length === 0) {
      setItemsWithDiscount([]);
      return;
    }

    const fetchDiscounts = async () => {
      const getDiscountedPrice = async (itemName, category, basePrice) => {
        return await Meteor.callAsync(
          'promotions.getDiscountedPrice',
          itemName,
          category,
          basePrice,
          null
        );
      };

      // Map each menu item to its discounted data
      const updatedItems = [];
      for (const item of itemsWithAvailability){
        try {
            const discountResult = await getDiscountedPrice(item.name, item.menuCategory, item.price);
            updatedItems.push({
              ...item,
              discountedPrice: discountResult.finalPrice,
              discountAmount: discountResult.discount,
              appliedPromotion: discountResult.appliedPromotion,
              isCurrentlyAvailable: getIsCurrentlyAvailable(item),
            });
          } catch (error) {
            updatedItems.push({
              ...item,
              discountedPrice: item.price,
              discountAmount: 0,
              appliedPromotion: null,
              isCurrentlyAvailable: getIsCurrentlyAvailable(item),
            });
          }
      }
      setItemsWithDiscount(updatedItems);
    };

    fetchDiscounts();
  }, [menuItems]);

  const itemsToRender = (itemsWithDiscount.length > 0 ? itemsWithDiscount : itemsWithAvailability).map(item => ({
    ...item,
    isCurrentlyAvailable: getIsCurrentlyAvailable(item),
  }));

  // 5) Sort available items first
  const sortedItems = itemsToRender.sort((a, b) => {
    if (a.isCurrentlyAvailable === b.isCurrentlyAvailable) return 0;
    return a.isCurrentlyAvailable ? -1 : 1;
  });

  // 6) Render cards
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
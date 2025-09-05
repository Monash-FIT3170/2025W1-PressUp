import React, { useState } from 'react';
import './KitchenOrderCard.css';
import OrderActionButton from './OrderActionButton.jsx';

import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { useEffect } from 'react';
import { Menu } from '../../../api/menu/menu-collection.js';
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator.jsx";
import { InventoryCollection } from '../../../api/inventory/inventory-collection.js';

function formatAEST(date) {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (_) {
    return date.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });
  }
}

const KitchenIngredientCard = ({ingredient,setShowModal,setModalIngredient,setModalName}) => {
  const [ingName,setIngName] = useState("");
  const [ingUnit,setIngUnit] = useState("");
  const isLoading = useSubscribe("inventory.id",ingredient.id);
  var completeIngredient = useFind(() => InventoryCollection.find({_id:ingredient.id}),[ingredient.id]);
  useEffect(() => {
    if (completeIngredient.length > 0) {
      setIngName(completeIngredient[0].name);
      setIngUnit(completeIngredient[0].units);
    }
  }, [completeIngredient]);
  if (isLoading()) {
    return <></>;
  }

  return (
    <>
      <span className='koc-ing' onClick={()=>{
        setShowModal(true);
        setModalIngredient(completeIngredient);
        setModalName(ingName)
      }}>{ingName}</span>
      <span>{ingredient.amount} {ingUnit}</span>
    </>
  )
}

const KitchenRecipeCard = ({ item, setShowModal, setModalIngredient, setModalName }) => {
    const [ingredients,setIngredients] = useState([]);
    const isLoading = useSubscribe("menuItems.id",item.id);
    const menuItem = useFind(() => Menu.find({_id:item.id}), [item.id]);
    useEffect(() => {
      if (menuItem.length > 0) {
        setIngredients(menuItem[0].ingredients);
      }
    }, [menuItem]);
    if (isLoading()) {
      return <><span className="koc-qty">{item.quantity}&times;</span>
          <span className="koc-name">{item.menu_item}</span></>;
    }
    

    return (
          <>
          <span className="koc-qty">{item.quantity}&times;</span>
          <span className="koc-name" onClick={()=>{
        setShowModal(true);
        setModalIngredient(ingredients);
        setModalName(item.menu_item)
      }}>{item.menu_item}</span>
          <ul>{ingredients.map((ing, idx) => (
          <li key={ing.id || idx} className="koc-recipe">
          <KitchenIngredientCard 
            ingredient={ing}
            setModalIngredient={setModalIngredient}
            setShowModal={setShowModal}
            setModalName={setModalName}
          />
          </li>
        ))}</ul>
          </>
    )
}

const KitchenOrderCard = ({ order, setShowModal, setModalIngredient, setModalName }) => {
  const { _id, table, items = [], createdAt } = order;

  return (
    <div className="kitchen-order-card">
      <div className="koc-head">
        <h3 className="koc-title">Table {table}</h3>
        <span className="koc-time">Ordered at: {formatAEST(new Date(createdAt))}</span>
      </div>

      <ul className="koc-items">
        {items.map((it, idx) => (
          <li key={it.id || idx} className="koc-item">
          <KitchenRecipeCard 
            item = {it}
            setModalIngredient={setModalIngredient}
            setShowModal={setShowModal}
            setModalName={setModalName}
          />
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="koc-actions">
        <OrderActionButton
          orderId={_id}
          methodName="orders.markClosed"
          label="Complete Order"
          className="complete"
        />
        <OrderActionButton
          orderId={_id}
          methodName="orders.markCancelled"
          label="Cancel Order"
          className="cancel"
        />
      </div>
    </div>
  );
};

export default KitchenOrderCard;

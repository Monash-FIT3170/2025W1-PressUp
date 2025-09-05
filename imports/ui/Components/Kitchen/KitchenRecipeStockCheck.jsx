import { useEffect } from 'react';
import React, { useState } from 'react';
import "../IngredientTable/IngredientTable.css";
import "./KitchenRecipeStockCheck.css"
import { capitalizeFirstLetter } from "../../../utils/utils.js";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { InventoryCollection } from '../../../api/inventory/inventory-collection.js';

export const KitchenRecipeStockCheck = ({onClose,inIngredients,name = 'menu item/ingredient'}) => {
    var ids = [];
    for (const ingredient of inIngredients) {
        ids.push(ingredient)
    }
    const isLoading = useSubscribe("inventory.ids",ids);
    const ingredients = useFind(() => InventoryCollection.find({_id:{$in:ids}}),[inIngredients]);
    if (isLoading()) {
        return <></>
    }


    const headers = Object.keys(ingredients[0])
    .filter((header) => header !== "_id")
    .map((header) => capitalizeFirstLetter(header));

    return (
        <div className='modal-overlay'>
        <div className='modal'>
        <button className="action-button" onClick={onClose}>X</button>
        <div className='header'>{name}</div>
        <table className="ingredient-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient, index) => (
            <tr key={index}>
              <td>{ingredient.name}</td>
              <td>
                <div className="number-pill">{ingredient.quantity}</div>
              </td>
              <td>{ingredient.units}</td>
              <td>
                <div className="number-pill">{ingredient.price}</div>
              </td>
              <td>{ingredient.suppliers}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    )
};
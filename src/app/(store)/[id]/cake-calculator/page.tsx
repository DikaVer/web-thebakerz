'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Input,
  Select,
  SelectItem,
  Button,
  Accordion,
  AccordionItem,
  Divider,
  Checkbox,
  CheckboxGroup,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

// Types
type Ingredient = {
  name: string;
  defaultUnit: string;
  units: string[];
};

type SelectedIngredient = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  pricePerUnit: number;
};

type EquipmentSupplies = {
  equipmentRental: number;
  numBoxes: number;
  pricePerBox: number;
  electricityCostPerUnit: number;
  electricityUnitsUsed: number;
  otherSupplies: number;
};

type Labor = {
  hoursSpent: number;
  costPerHour: number;
};

type Delivery = {
  distance: number;
  distanceUnit: string;
  costPerKm: number;
};

// Available ingredients
const INGREDIENTS: Ingredient[] = [
  { name: 'Flour', defaultUnit: 'cups', units: ['cups', 'grams', 'kg'] },
  { name: 'Sugar', defaultUnit: 'cups', units: ['cups', 'grams', 'kg'] },
  { name: 'Eggs', defaultUnit: 'pieces', units: ['pieces'] },
  { name: 'Milk', defaultUnit: 'cups', units: ['cups', 'ml', 'liters'] },
  { name: 'Butter/Oil', defaultUnit: 'cups', units: ['cups', 'grams', 'ml'] },
  { name: 'Cream Cheese', defaultUnit: 'grams', units: ['grams', 'kg'] },
  { name: 'Yeast', defaultUnit: 'tablespoons', units: ['tablespoons', 'grams'] },
  { name: 'Baking Powder', defaultUnit: 'tablespoons', units: ['tablespoons', 'grams'] },
  { name: 'Cacao Powder', defaultUnit: 'tablespoons', units: ['tablespoons', 'grams', 'cups'] },
  { name: 'Chocolate', defaultUnit: 'grams', units: ['grams', 'kg'] },
  { name: 'Sour Cream', defaultUnit: 'cups', units: ['cups', 'grams', 'ml'] },
  { name: 'Vanilla', defaultUnit: 'tablespoons', units: ['tablespoons', 'ml'] },
  { name: 'Fresh Fruit', defaultUnit: 'grams', units: ['grams', 'kg', 'pieces'] },
  { name: 'Other', defaultUnit: 'units', units: ['units', 'grams', 'kg', 'cups', 'ml'] },
];

export default function CakeCalculatorPage() {
  // State management
  const [selectedIngredientNames, setSelectedIngredientNames] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
  const [equipmentSupplies, setEquipmentSupplies] = useState<EquipmentSupplies>({
    equipmentRental: 0,
    numBoxes: 0,
    pricePerBox: 0,
    electricityCostPerUnit: 0,
    electricityUnitsUsed: 0,
    otherSupplies: 0,
  });
  const [labor, setLabor] = useState<Labor>({
    hoursSpent: 0,
    costPerHour: 0,
  });
  const [delivery, setDelivery] = useState<Delivery>({
    distance: 0,
    distanceUnit: 'km',
    costPerKm: 0,
  });
  const [servings, setServings] = useState<number>(1);

  // Handle ingredient selection/deselection
  const handleIngredientSelection = (selected: string[]) => {
    setSelectedIngredientNames(selected);
    
    // Add newly selected ingredients
    const newIngredients = selected.filter(
      name => !ingredients.find(ing => ing.name === name)
    ).map(name => {
      const ingredient = INGREDIENTS.find(i => i.name === name)!;
      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        amount: 0,
        unit: ingredient.defaultUnit,
        pricePerUnit: 0,
      };
    });

    // Remove deselected ingredients
    const filteredIngredients = ingredients.filter(ing => 
      selected.includes(ing.name)
    );

    setIngredients([...filteredIngredients, ...newIngredients]);
  };

  // Update ingredient field
  const updateIngredient = (id: string, field: keyof SelectedIngredient, value: any) => {
    setIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  // Remove ingredient
  const removeIngredient = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (ingredient) {
      setSelectedIngredientNames(prev => prev.filter(name => name !== ingredient.name));
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    }
  };

  // Calculations
  const totalIngredientsCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + (ing.amount * ing.pricePerUnit), 0);
  }, [ingredients]);

  const totalEquipmentCost = useMemo(() => {
    return (
      equipmentSupplies.equipmentRental +
      equipmentSupplies.numBoxes * equipmentSupplies.pricePerBox +
      equipmentSupplies.electricityCostPerUnit * equipmentSupplies.electricityUnitsUsed +
      equipmentSupplies.otherSupplies
    );
  }, [equipmentSupplies]);

  const totalLaborCost = useMemo(() => {
    return labor.hoursSpent * labor.costPerHour;
  }, [labor]);

  const totalDeliveryCost = useMemo(() => {
    return delivery.distance * delivery.costPerKm;
  }, [delivery]);

  const totalCost = useMemo(() => {
    return totalIngredientsCost + totalEquipmentCost + totalLaborCost + totalDeliveryCost;
  }, [totalIngredientsCost, totalEquipmentCost, totalLaborCost, totalDeliveryCost]);

  const pricePerServing = useMemo(() => {
    return servings > 0 ? totalCost / servings : 0;
  }, [totalCost, servings]);

  // Actions
  const handleReset = () => {
    setSelectedIngredientNames([]);
    setIngredients([]);
    setEquipmentSupplies({
      equipmentRental: 0,
      numBoxes: 0,
      pricePerBox: 0,
      electricityCostPerUnit: 0,
      electricityUnitsUsed: 0,
      otherSupplies: 0,
    });
    setLabor({
      hoursSpent: 0,
      costPerHour: 0,
    });
    setDelivery({
      distance: 0,
      distanceUnit: 'km',
      costPerKm: 0,
    });
    setServings(1);
  };

  const handleShare = async () => {
    const text = `Cake Calculator Results:\nTotal Cost: €${totalCost.toFixed(2)}\nPrice per Serving: €${pricePerServing.toFixed(2)}\nServings: ${servings}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-transparent">
            Cake Pricing Calculator
          </h1>
          <p className="text-default-500">
            Calculate the total cost and price per serving for your cake
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <Button
            color="default"
            variant="flat"
            startContent={<Icon icon="solar:refresh-linear" width={20} />}
            onPress={handleReset}
          >
            Reset All
          </Button>
        </div>

        {/* Main Calculator */}
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          defaultExpandedKeys={['ingredients', 'results']}
          className="gap-4"
        >
          {/* Ingredients Section */}
          <AccordionItem
            key="ingredients"
            aria-label="Ingredients"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:pie-chart-2-linear" width={24} />
                <span className="text-lg font-semibold">Ingredients</span>
              </div>
            }
            subtitle={`Total: €${totalIngredientsCost.toFixed(2)}`}
          >
            <div className="space-y-4">
              {/* Ingredient Selection */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-md font-medium">Select Ingredients</h3>
                </CardHeader>
                <CardBody>
                  <CheckboxGroup
                    value={selectedIngredientNames}
                    onValueChange={handleIngredientSelection}
                    classNames={{
                      base: 'w-full',
                    }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {INGREDIENTS.map(ingredient => (
                        <Checkbox key={ingredient.name} value={ingredient.name}>
                          {ingredient.name}
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>
                </CardBody>
              </Card>

              {/* Ingredients Amount and Price */}
              {ingredients.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-md font-medium">Ingredients Amount and Price</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {ingredients.map(ing => {
                        const ingredientDef = INGREDIENTS.find(i => i.name === ing.name);
                        return (
                          <div
                            key={ing.id}
                            className="flex flex-col md:flex-row gap-2 items-start md:items-end p-3 rounded-lg bg-default-50"
                          >
                            <div className="flex-shrink-0 font-medium text-sm pt-2 md:w-32">
                              {ing.name}
                            </div>
                            <Input
                              type="number"
                              label="Amount"
                              size="sm"
                              value={ing.amount.toString()}
                              onValueChange={(value) =>
                                updateIngredient(ing.id, 'amount', parseFloat(value) || 0)
                              }
                              className="max-w-[120px]"
                            />
                            <Select
                              label="Unit"
                              size="sm"
                              selectedKeys={[ing.unit]}
                              onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                updateIngredient(ing.id, 'unit', selected);
                              }}
                              className="max-w-[140px]"
                            >
                              {ingredientDef!.units.map(unit => (
                                <SelectItem key={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </Select>
                            <Input
                              type="number"
                              label={`Price per ${ing.unit}`}
                              size="sm"
                              startContent="€"
                              value={ing.pricePerUnit.toString()}
                              onValueChange={(value) =>
                                updateIngredient(ing.id, 'pricePerUnit', parseFloat(value) || 0)
                              }
                              className="max-w-[150px]"
                            />
                            <div className="text-sm font-medium min-w-[80px] pt-2">
                              €{(ing.amount * ing.pricePerUnit).toFixed(2)}
                            </div>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => removeIngredient(ing.id)}
                            >
                              <Icon icon="solar:trash-bin-trash-linear" width={20} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                  <CardFooter className="justify-between border-t">
                    <span className="font-semibold">Total Ingredients Cost:</span>
                    <span className="text-lg font-bold text-primary">
                      €{totalIngredientsCost.toFixed(2)}
                    </span>
                  </CardFooter>
                </Card>
              )}
            </div>
          </AccordionItem>

          {/* Equipment, Boxes & Electricity */}
          <AccordionItem
            key="equipment"
            aria-label="Equipment & Supplies"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:box-linear" width={24} />
                <span className="text-lg font-semibold">Equipment, Boxes & Electricity</span>
              </div>
            }
            subtitle={`Total: €${totalEquipmentCost.toFixed(2)}`}
          >
            <Card>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Equipment Rental"
                    placeholder="0.00"
                    startContent="€"
                    value={equipmentSupplies.equipmentRental.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        equipmentRental: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    label="Number of Boxes"
                    placeholder="0"
                    value={equipmentSupplies.numBoxes.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        numBoxes: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    label="Price per Box"
                    placeholder="0.00"
                    startContent="€"
                    value={equipmentSupplies.pricePerBox.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        pricePerBox: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <div className="flex items-center text-sm text-default-500">
                    Packaging cost: €
                    {(equipmentSupplies.numBoxes * equipmentSupplies.pricePerBox).toFixed(2)}
                  </div>
                  <Input
                    type="number"
                    label="Electricity Cost per Unit (€/kWh)"
                    placeholder="0.00"
                    startContent="€"
                    value={equipmentSupplies.electricityCostPerUnit.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        electricityCostPerUnit: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    label="Units of Electricity Used (kWh)"
                    placeholder="0"
                    value={equipmentSupplies.electricityUnitsUsed.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        electricityUnitsUsed: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <div className="flex items-center text-sm text-default-500">
                    Electricity cost: €
                    {(
                      equipmentSupplies.electricityCostPerUnit *
                      equipmentSupplies.electricityUnitsUsed
                    ).toFixed(2)}
                  </div>
                  <Input
                    type="number"
                    label="Other Supplies"
                    placeholder="0.00"
                    startContent="€"
                    value={equipmentSupplies.otherSupplies.toString()}
                    onValueChange={(value) =>
                      setEquipmentSupplies(prev => ({
                        ...prev,
                        otherSupplies: parseFloat(value) || 0,
                      }))
                    }
                  />
                </div>
              </CardBody>
              <CardFooter className="justify-between border-t">
                <span className="font-semibold">Total Equipment & Supplies Cost:</span>
                <span className="text-lg font-bold text-primary">
                  €{totalEquipmentCost.toFixed(2)}
                </span>
              </CardFooter>
            </Card>
          </AccordionItem>

          {/* Labor Section */}
          <AccordionItem
            key="labor"
            aria-label="Labor (Time)"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:clock-circle-linear" width={24} />
                <span className="text-lg font-semibold">Labor (Time)</span>
              </div>
            }
            subtitle={`Total: €${totalLaborCost.toFixed(2)}`}
          >
            <Card>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Hours Spent"
                    placeholder="0"
                    endContent={<span className="text-default-400 text-sm">hours</span>}
                    value={labor.hoursSpent.toString()}
                    onValueChange={(value) =>
                      setLabor(prev => ({
                        ...prev,
                        hoursSpent: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    label="Cost per Hour"
                    placeholder="0.00"
                    startContent="€"
                    value={labor.costPerHour.toString()}
                    onValueChange={(value) =>
                      setLabor(prev => ({
                        ...prev,
                        costPerHour: parseFloat(value) || 0,
                      }))
                    }
                  />
                </div>
              </CardBody>
              <CardFooter className="justify-between border-t">
                <span className="font-semibold">Total Labor Cost:</span>
                <span className="text-lg font-bold text-primary">
                  €{totalLaborCost.toFixed(2)}
                </span>
              </CardFooter>
            </Card>
          </AccordionItem>

          {/* Delivery Section */}
          <AccordionItem
            key="delivery"
            aria-label="Delivery"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:delivery-linear" width={24} />
                <span className="text-lg font-semibold">Delivery</span>
              </div>
            }
            subtitle={`Total: €${totalDeliveryCost.toFixed(2)}`}
          >
            <Card>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    label="Distance"
                    placeholder="0"
                    value={delivery.distance.toString()}
                    onValueChange={(value) =>
                      setDelivery(prev => ({
                        ...prev,
                        distance: parseFloat(value) || 0,
                      }))
                    }
                  />
                  <Select
                    label="Unit"
                    selectedKeys={[delivery.distanceUnit]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setDelivery(prev => ({ ...prev, distanceUnit: selected }));
                    }}
                  >
                    <SelectItem key="km">
                      Kilometers (km)
                    </SelectItem>
                    <SelectItem key="miles">
                      Miles
                    </SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label={`Cost per ${delivery.distanceUnit === 'km' ? 'Kilometer' : 'Mile'}`}
                    placeholder="0.00"
                    startContent="€"
                    value={delivery.costPerKm.toString()}
                    onValueChange={(value) =>
                      setDelivery(prev => ({
                        ...prev,
                        costPerKm: parseFloat(value) || 0,
                      }))
                    }
                  />
                </div>
              </CardBody>
              <CardFooter className="justify-between border-t">
                <span className="font-semibold">Total Delivery Cost:</span>
                <span className="text-lg font-bold text-primary">
                  €{totalDeliveryCost.toFixed(2)}
                </span>
              </CardFooter>
            </Card>
          </AccordionItem>

          {/* Results Section */}
          <AccordionItem
            key="results"
            aria-label="Total Cost & Results"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:calculator-linear" width={24} />
                <span className="text-lg font-semibold">Total Cost & Results</span>
              </div>
            }
          >
            <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
              <CardBody>
                <div className="space-y-6">
                  {/* Number of Servings */}
                  <Input
                    type="number"
                    label="Number of Cake Servings"
                    placeholder="1"
                    size="lg"
                    value={servings.toString()}
                    onValueChange={(value) => setServings(parseFloat(value) || 1)}
                    classNames={{
                      input: 'text-lg',
                    }}
                  />

                  <Divider />

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">Ingredients:</span>
                      <span className="font-medium">€{totalIngredientsCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">Equipment & Supplies:</span>
                      <span className="font-medium">€{totalEquipmentCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">Labor:</span>
                      <span className="font-medium">€{totalLaborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-default-600">Delivery:</span>
                      <span className="font-medium">€{totalDeliveryCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <Divider />

                  {/* Total Results */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg bg-white shadow-sm">
                      <span className="text-lg font-semibold">Total Cost of Making the Cake:</span>
                      <span className="text-2xl font-bold text-primary">
                        €{totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-white shadow-sm">
                      <span className="text-lg font-semibold">Price per Serving:</span>
                      <span className="text-2xl font-bold text-secondary">
                        €{pricePerServing.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Helper Text */}
                  <p className="text-xs text-default-400 text-center">
                    💡 Tip: Fields left at zero are excluded from the calculation
                  </p>
                </div>
              </CardBody>
            </Card>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}


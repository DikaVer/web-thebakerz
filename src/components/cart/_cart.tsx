// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {IconAvatar, IconPlus} from "@/components/ui/icons";
// import Image from "next/image";
// import Stepper from "@/components/cart/stepper";
// import {Button} from "@/components/ui/button";
// import {getAll} from "@/lib/actions/session-store";
// import {getCart} from "@/lib/store/store-dto";
//
// interface CartComponentProps {
//     onClose: () => void;
//     isOpen: boolean;
//     cart: ShopItem[]; // Add cart prop
// }
//
// const CartComponent: React.FC<CartComponentProps> = ({ onClose, isOpen, cart }) => {
//     const [isVisible, setIsVisible] = useState(false);
//
//
//     useEffect(() => {
//         if (isOpen) {
//             setIsVisible(true);
//         } else {
//             const timer = setTimeout(() => setIsVisible(false), 500);
//             return () => clearTimeout(timer);
//         }
//     }, [isOpen]);
//
//     return (
//         <div
//             className={`fixed inset-0 z-50 transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isVisible ? 'visible' : 'invisible'}`}>
//
//             <div className="absolute bg-black opacity-50 inset-0" onClick={onClose}></div>
//             <div
//                 className={`absolute right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//                 <p className="text-2xl flex justify-center items-center p-4">Delicious Cart</p>
//                 <hr className={"mx-2"}></hr>
//                 {cart ? (
//                     <ShopList cart={cart} onClose={onClose} />
//                 ) : (
//                     <p className={"text-center mt-5 text-xl"}>Your cart is empty 🥲</p>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// const ShopList: React.FC<{ cart: any, onClose: () => void }> = ({ cart, onClose }) => {
//
//     return (
//         <Accordion type="single" collapsible className="w-full">
//             {Object.keys(cart).map((shopName, index) => (
//                 <Shop
//                     key={index}
//                     avatar_url={cart[shopName]['avatar_url']}
//                     shopName={shopName}
//                     value={`shop-${index}`}
//                     initialItems={cart[shopName]['products']}
//                     onClose={onClose}
//                 />
//             ))}
//         </Accordion>
//     );
// };
//
// interface ShopItem {
//     product_id: number;
//     name: string;
//     description: string;
//     price: number;
//     image_url: string;
//     amount: number;
// }
//
// interface ShopProps {
//     avatar_url: string;
//     shopName: string;
//     value: string;
//     initialItems: ShopItem[];
//     onClose: () => void;
// }
//
// const Shop: React.FC<ShopProps> = ({ avatar_url, shopName, value, initialItems, onClose }) => {
//     const [itemsList, setItemsList] = useState(initialItems);
//     const [isHoveringStepper, setIsHoveringStepper] = useState(false);
//
//     useEffect(() => {
//         setItemsList(initialItems); // When the cart prop changes, update the items list
//     }, [initialItems]);
//
//     const deleteItem = useCallback((id: number) => {
//         setItemsList(itemsList.filter(item => item.product_id !== id));
//     }, [itemsList]);
//
//     if (itemsList.length === 0) {
//         return null;
//     }
//
//     return (
//         <AccordionItem value={value}>
//             <AccordionTrigger>
//                 <div className={"-my-2 flex flex-row items-center space-x-3 justify-start"}>
//                     <Image
//                         src={avatar_url}
//                         alt="Avatar"
//                         width={1920}
//                         height={1080}
//                         className="rounded-full relative h-14 w-14"
//                     />
//                     <div className={"grid grid-col gap-0"}>
//                         <p className={"flex text-base underline-on-hover"}>{shopName}</p>
//                         <p className={"flex text-sm text-grayText"}>{itemsList.length} items</p>
//                     </div>
//                 </div>
//             </AccordionTrigger>
//             <AccordionContent className={"grid gap-y-4 w-full"}>
//                 <ScrollArea className="max-h-72">
//                     <ul className={"grid"}>
//                         {Object.values(itemsList).map((item) => (
//                             <ShopItem
//                                 key={item.product_id}
//                                 {...item}
//                                 onDelete={deleteItem}
//                                 onHoverChange={setIsHoveringStepper}
//                                 isHoveringStepper={isHoveringStepper}
//                             />
//                         ))}
//                     </ul>
//                 </ScrollArea>
//                 <div className={"grid gap-y-2 px-2"}>
//                     {/*<div className={"flex flex-row justify-between"}>*/}
//                     {/*    <p className={"text-xl"}>Subtotal</p>*/}
//                     {/*    <p className={"text-xl"}>$12.48</p>*/}
//                     {/*</div>*/}
//                     <Button className={"w-full py-0 px-4"}>
//                         <div className={"flex flex-row w-full justify-between items-center"}>
//                             <p className={"text-xl"}>Checkout</p>
//                             <p className={"text-lg"}>$12.48</p>
//                         </div>
//                     </Button>
//                     <Button className={"w-full py-0 px-4"} onClick={onClose} variant="secondary">
//                         <div className={"flex flex-row w-full justify-between items-center"}>
//                             <p className={"text-black text-lg"}>Add items</p>
//                             <IconPlus className={"w-7 h-7"}/>
//                         </div>
//                     </Button>
//                 </div>
//             </AccordionContent>
//         </AccordionItem>
//     );
// };
//
// interface ShopItemProps {
//     product_id: number;
//     name: string;
//     price: number;
//     image_url: string;
//     amount: number;
//     description?: string;
//     rating?: string;
//     onDelete: (id: number) => void;
//     onHoverChange: (isHovering: boolean) => void;
//     isHoveringStepper: boolean;
// }
//
// const ShopItem: React.FC<ShopItemProps> = ({ product_id, name, price, image_url, onDelete, onHoverChange, isHoveringStepper }) => (
//
//     <>
//         <li className={`flex flex-row rounded transition duration-500 ${!isHoveringStepper ? 'hover:bg-grayBg' : ''} cursor-pointer my-1`}>
//             <div className="p-2">
//                 <div className="h-16 w-16">
//                     <Image
//                         src={image_url}
//                         width={1920}
//                         height={1080}
//                         alt="Product"
//                         className="rounded-xl"
//                     />
//                 </div>
//             </div>
//             <div className="flex flex-col gap-0.5 justify-between p-1 w-full">
//                 <span className="text-base">{name}</span>
//                 <div className="flex flex-row justify-between items-end">
//                     <p className="text-grayText text-base">{price}</p>
//                     <Stepper onDelete={() => onDelete(product_id)} onHoverChange={onHoverChange}/>
//                 </div>
//             </div>
//         </li>
//         <hr className={"scale-y-300 border-grayBg"}></hr>
//     </>
// );
//
// export default CartComponent;
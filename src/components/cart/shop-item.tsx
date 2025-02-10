import React, {useState} from 'react';
import {CartItem} from "@/lib/definitions";
import {formatCurrency} from "@/lib/utils";
import {Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Button} from "@/components/ui/button";
import SliderStepper from "@/components/cart/slider";
import {IconTrash} from "@/components/ui/icons";
import {backdropEffect} from "@/lib/local-variables";
import {ScrollShadow} from "@heroui/scroll-shadow";

interface ShopItemProps extends CartItem {
    onDelete: (id: string) => void;
    onUpdate: (id: string, amount: number) => void;
    isUpdating: (isUpdating: boolean) => void;
    onHoverChange: (isHovering: boolean) => void;
    isHoveringStepper: boolean;
}

const ShopItem: React.FC<ShopItemProps> = ({
    uniqueId,
    id,
    description,
    price,
    name,
    category,
    store_id,
    quantity,
    image_url,
    onDelete,
    onUpdate,
    isHoveringStepper,
}) => {
    // Divide the price by 100
    const displayPrice = formatCurrency((price * quantity));


    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <li
                className={`flex flex-col rounded w-full  p-4 transition duration-500 ${!isHoveringStepper ? 'hover:bg-grayBg' : ''}  my-1`}
            >
                <div className={`flex flex-row cursor-pointer`}

                >
                    <div className="mb-4">
                        <div className="h-24 w-24">
                            <Image
                                isBlurred
                                src={image_url}
                                alt={`Image of ${name}`}
                                className={"rounded-xl object-center"}
                                width={96}
                                height={96}
                            />
                        </div>
                    </div>
                    <div className="flex flex-row justify-between w-full ml-2">
                        <div>
                            <span className="text-base font-medium">{name}</span>
                            <p className="text-grayText font-medium text-base">{displayPrice}</p>
                        </div>
                        <div className="flex flex-col justify-between items-end ">
                            <Button
                                variant={"light"}
                                color={"danger"}
                                onClick={() => setIsOpen(true)}
                            >
                                <IconTrash className={`w-7 h-7 text-text`}/>
                            </Button>
                            <Button
                                variant={"outline"}
                                className={'mb-3'}

                            >
                                Overview
                            </Button>
                        </div>
                    </div>
                </div>
                <SliderStepper
                    product_id={uniqueId}
                    productName={name}
                    onUpdate={onUpdate}
                    amount={quantity}
                />
            </li>
            <DeleteRequestConfirmation
                name={name}
                image_url={image_url}
                onClose={() => setIsOpen(false)}
                isOpen={isOpen}
                onConfirm={() => onDelete(uniqueId)}
            />
            <hr className="border-grayBg mx-2"/>
        </>
    );
};


const DeleteRequestConfirmation: React.FC<{
    name: string,
    image_url: string,
    onClose: () => void,
    isOpen: boolean,
    onConfirm: () => void
}> = ({ onConfirm, image_url, onClose, isOpen, name }) => {


    return (
        <Modal backdrop={backdropEffect} isOpen={isOpen} onClose={onClose} size={'xs'} shadow={"lg"} placement={"center"}>
            <ModalContent>

                {(onClose) => (
                    <>
                        <ModalHeader>
                            Do you want to delete {name} from your cart?
                        </ModalHeader>
                        <ModalBody>
                            <div className={`flex flex-row`}>
                                <div className="mb-4">
                                    <div className="h-24 w-24">
                                        <Image
                                            isBlurred
                                            src={image_url}
                                            alt={`Image of ${name}`}
                                            className={"rounded-xl object-center"}
                                            width={96}
                                            height={96}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between w-full ml-2">
                                    <div>
                                        <span className="text-lg font-medium">{name}</span>
                                    </div>
                                </div>
                            </div>
                                After deleting, you can&apos;t undo this action.
                        </ModalBody>
                        <ModalFooter>
                            <Button variant={"outline"} onPress={onClose}>
                                Close
                            </Button>
                            <Button color="danger" variant="light" onPress={onConfirm}>
                                Delete
                            </Button>
                        </ModalFooter>
                    </>
                    )}
            </ModalContent>
        </Modal>
);
}

export default ShopItem;

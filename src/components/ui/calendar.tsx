"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {DayPicker, DayProps} from "react-day-picker"
import { addDays } from 'date-fns';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

import {cn, formatDataDate, formatDate, formatDateTime} from "@/lib/utils"
import {Button, buttonVariants} from "@/components/ui/button"
import {MouseEventHandler, useEffect, useState} from "react";
import {DaySelection} from "@/components/store/maintaince/availability-selection";
import {FormError} from "@/components/authentication/form-error";
import {backdropEffect, timeMap} from "@/lib/local-variables";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/react";
import {ScrollShadow} from "@nextui-org/scroll-shadow";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
    panelClassName?:{
        width?: string;
        justifyContent?: string;
        mx?: string;
    }
    setAvailabilityData?: React.Dispatch<React.SetStateAction<Record<string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }>>>;
    availabilityData?: Record<string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }>;
    userView?: boolean;
    addDaysParam?: number;
    onSelectCustom?: (date: Date | undefined) => void; // Add onSelect prop
};



function CustomDayCell(
    {
        fromDay,
        onClick,
        availabilityData,
        date,
        displayMonth,
    }: {
        fromDay: Date;
        onClick: (day: Date) => void;
        availabilityData: Record<string,
            {
                from: keyof typeof timeMap;
                to: keyof typeof timeMap;
                availability: "Free" | "Busy";
            }>;
        date: Date,
        displayMonth: Date,
    }
) {
    const [buttonVariant, setButtonVariant] = useState<"closed" | "ghost" | "free" | "busy" | "link" | "disabled" | "default" | "destructive" | "outline" | "secondary" | null | undefined>("closed");

    const getButtonVariant = (date: Date | null) => {
        if (!date) return "closed"; // Default variant for no date
        if (date < fromDay) return "ghost"; // Default variant for past dates

        const dateKey = formatDataDate(date); // Format the date to 'YYYY-MM-DD'
        const availability = availabilityData[dateKey]?.availability;

        if (availability === "Free") return "free"; // Green for free
        if (availability === "Busy") return "busy"; // Orange for busy
        return "closed"; // Default variant for no data
    };

    useEffect(() => {
        setButtonVariant(getButtonVariant(date));
    }, [availabilityData]);

    return (
        <button
            className={cn(
                buttonVariants({ variant: buttonVariant }),
                `h-8 w-8 p-0 font-medium text-sm`
            )}
            onClick={() => onClick(date)}
            disabled={date < fromDay}
        >
            {date.getDate()}
        </button>
    );
}

function Calendar({
                      className,
                      classNames,
                      panelClassName,
                      showOutsideDays = true,
                      availabilityData,
                      setAvailabilityData,
                      userView = false,
                      addDaysParam = 0,
                      onSelectCustom,
                      ...props
                    }:
                      CalendarProps
) {
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [availability, setAvailability] = useState<"Free" | "Busy" | "Closed">("Closed")
    const [fromTime, setFromTime] = useState<string | undefined>(undefined)
    const [toTime, setToTime] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | undefined>(undefined)

    const today = addDays(new Date(), addDaysParam);

    useEffect(() => {
        if (availabilityData && selectedDay) {
            const dateKey = formatDateTime(selectedDay);
            if (availabilityData[dateKey]) {
                setFromTime(formatDateTime(timeMap[availabilityData[dateKey].from].from))
                setToTime(formatDateTime(timeMap[availabilityData[dateKey].from].to))
                setAvailability(availabilityData[dateKey].availability)
            } else {
                setFromTime(undefined)
                setToTime(undefined)
                setAvailability("Closed")
            }
            setError(undefined)
        }
    }, [selectedDay]);

    const handleDayClick = (day: Date) => {
        setSelectedDay(day)
        !onSelectCustom && setIsDialogOpen(true)
        onSelectCustom && onSelectCustom(day);
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
    }

    const handleApply = () => {
        if (selectedDay && availability && setAvailabilityData) {
            if (availability !== "Closed" && fromTime && toTime) {
                const updatedAvailabilityData = {
                    ...availabilityData,
                    [formatDataDate(selectedDay)]: {
                        from: fromTime,
                        to: toTime,
                        availability: availability
                    }
                }
                // Update the state with the new availability data
                setAvailabilityData(updatedAvailabilityData)
            } else if (availability === "Closed") {
                const updatedAvailabilityData = {...availabilityData}
                delete updatedAvailabilityData[formatDataDate(selectedDay)]
                setAvailabilityData(updatedAvailabilityData)
            } else {
                setError("Please fill both from and to time!")
                return
            }
            setToTime(undefined)
            setFromTime(undefined)
            setAvailability("Closed")
            setIsDialogOpen(false)
            setError(undefined)

        } else {
            setError("Please fill in all the fields")
        }
    }

    const components = availabilityData ?
        {
            IconLeft: ({...props}) => <ChevronLeft className="h-4 w-4"/>,
            IconRight: ({...props}) => <ChevronRight className="h-4 w-4"/>,
            Day: (props: DayProps) => <CustomDayCell
                fromDay={today}
                //@ts-ignore
                onClick={handleDayClick}
                availabilityData={availabilityData}
                {...props}
            />,
        } : {
            IconLeft: ({...props}) => <ChevronLeft className="h-4 w-4"/>,
            IconRight: ({...props}) => <ChevronRight className="h-4 w-4"/>,
        }



  return (
      <>
          <DayPicker
              showOutsideDays={showOutsideDays}
              className={cn("p-3", className, panelClassName?.width, panelClassName?.mx)}
              classNames={{
                  months: "flex flex-col cm:flex-row space-y-4 cm:space-x-4 cm:space-y-0",
                  month: `space-y-4 ${panelClassName?.width}`,
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-base font-bold",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                      buttonVariants({variant: "outline"}),
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: `flex ${panelClassName?.justifyContent}`,
                  head_cell:
                      "text-muted-foreground rounded-md w-9 text-[0.9rem] font-medium",
                  row: `flex ${panelClassName?.justifyContent} w-full mt-2`,
                  cell: "h-9 w-9 text-center text-sm p-0 relative",
                  day: cn(
                      buttonVariants({variant: "ghost"}),
                      "h-9 w-9 p-0 aria-selected:opacity-100"
                  ),
                  day_range_end: "day-range-end",
                  day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "text-accent-foreground",
                  day_outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  ...classNames,
              }}
              components={components}
              fromDate={today}
              {...props}
          />
          { availabilityData && selectedDay && userView &&
              // <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              //     <DialogContent handleClose={handleDialogClose}>
              //         <DialogTitle>Selected Day - {formatDate(selectedDay)}</DialogTitle>
              //         <DialogDescription className={"grid grid-cols-[0.5fr_1.5fr] "}>
              //             {selectedDay && availabilityData[formatDataDate(selectedDay)] ? (
              //                 <>
              //                     <strong>Store is open</strong>
              //                     <strong>From:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].from].from)}
              //                     <strong>To:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].to].from)}
              //                     <strong>Availability:</strong> {availabilityData[formatDataDate(selectedDay)].availability}
              //                 </>
              //
              //             ) : (
              //                 <>
              //                     <strong>Store is closed</strong>
              //                 </>
              //             )}
              //         </DialogDescription>
              //         <DialogFooter>
              //             <button
              //                 className={cn(buttonVariants({variant: "default"}))}
              //                 onClick={handleDialogClose}
              //             >
              //                 Close
              //             </button>
              //         </DialogFooter>
              //     </DialogContent>
              // </Dialog>
              <Modal backdrop={backdropEffect} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} size={'sm'} shadow={"lg"} placement={"center"}>
                  <ModalContent>
                      {(onClose) => (
                          <>
                              <ModalHeader>
                                  Selected Day - {formatDate(selectedDay)}
                              </ModalHeader>
                              <ModalBody>
                                  {selectedDay && availabilityData[formatDataDate(selectedDay)] ? (
                                      <>
                                          <strong>Store is open</strong>
                                          <p>
                                              <strong>From:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].from].from)}
                                          </p>
                                          <p>
                                              <strong>To:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].to].from)}
                                          </p>
                                          <p>
                                              <strong>Availability:</strong> {availabilityData[formatDataDate(selectedDay)].availability}
                                          </p>
                                      </>

                                  ) : (
                                      <>
                                          <strong>Store is closed</strong>
                                      </>
                                  )}
                              </ModalBody>
                              <ModalFooter>
                                  <Button
                                      variant="outline"
                                      onClick={handleDialogClose}
                                  >
                                      Close
                                  </Button>
                              </ModalFooter>
                          </>
                      )}
                  </ModalContent>
              </Modal>

          }
          {/* Dialog to open when a day is clicked */}
          {availabilityData && selectedDay && !userView &&
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent handleClose={handleDialogClose}>
                      <DialogTitle>Selected Day - {formatDate(selectedDay)}</DialogTitle>
                      <DialogDescription className={"grid grid-cols-[0.5fr_1.5fr] "}>
                          {selectedDay && availabilityData[formatDataDate(selectedDay)] ? (
                              <>
                                  <strong>From Time:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].from].from)}
                                  <strong>To Time:</strong> {formatDateTime(timeMap[availabilityData[formatDataDate(selectedDay)].to].from)}
                                  <strong>Availability:</strong> {availabilityData[formatDataDate(selectedDay)].availability}
                              </>

                          ) : (
                              <></>
                          )}
                      </DialogDescription>
                      <DaySelection
                          day={selectedDay ? formatDate(selectedDay) : ""}
                          fromTime={fromTime}
                          toTime={toTime}
                          setFromTime={setFromTime}
                          setToTime={setToTime}
                          availability={availability}
                          setAvailability={setAvailability}
                      />
                      <FormError message={error} />
                      <button
                          className={cn(buttonVariants({variant: "default"}))}
                          onClick={handleApply}
                      >
                          Apply
                      </button>
                  </DialogContent>
              </Dialog>
          }
      </>
  )
}

Calendar.displayName = "Calendar"


export { Calendar }

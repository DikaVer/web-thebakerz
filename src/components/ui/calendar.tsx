"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {DayPicker, DayProps} from "react-day-picker"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>


interface CustomDaycellProps extends DayProps {
    fromDay: Date;
    onClick: (day: Date) => void;
    availabilityData: Record<string, { from: string; to: string; availability: string }>;
}

function CustomDaycell(
    {
        fromDay,
        onClick,
        availabilityData,
        date,
        ...props
    }: {
        fromDay: Date;
        onClick: (day: Date) => void;
        availabilityData: Record<string, { from: string; to: string; availability: string }>;
        date: Date,
        displayMonth: Date
    }
) {

    const getButtonVariant = (date: Date | null) => {
        if (!date) return "closed" // Default variant for no date
        if (date < fromDay) return "ghost" // Default variant for past dates

        const dateKey = date.toISOString().split("T")[0] // Format the date to 'YYYY-MM-DD'
        const availability = availabilityData[dateKey]?.availability

        if (availability === "free") return "free" // Green for free
        if (availability === "busy") return "busy" // Orange for busy
        return "closed" // Default variant for no data
    }

    return (
        <button
            className={cn(
                buttonVariants({ variant: getButtonVariant(date) }),
                `h-9 w-9 p-0 font-normal text-sm`
            )}
            onClick={() => onClick(date)}
            disabled={date < fromDay}
            {...props}
        >
            {date.getDate()}
        </button>
    );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
    const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const today = new Date()

    const handleDayClick = (day: Date) => {
        setSelectedDay(day)
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
    }

    const availabilityData = {
        "2024-09-18": {
            from: "9:00AM",
            to: "9:00PM",
            availability: "busy",
        },
        "2024-09-19": {
            from: "9:00AM",
            to: "9:00PM",
            availability: "free",
        },
        // Add more dates as needed
    }


  return (
      <>
          <DayPicker
              showOutsideDays={showOutsideDays}
              className={cn("p-3", className)}
              classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                      buttonVariants({variant: "outline"}),
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                      buttonVariants({variant: "ghost"}),
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 bg"
                  ),
                  day_range_end: "day-range-end",
                  day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: " text-accent-foreground",
                  day_outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  ...classNames,
              }}
              components={{
                  IconLeft: ({...props}) => <ChevronLeft className="h-4 w-4"/>,
                  IconRight: ({...props}) => <ChevronRight className="h-4 w-4"/>,
                  Day: (props: DayProps) => <CustomDaycell
                      fromDay={today}
                      onClick={handleDayClick}
                      availabilityData={availabilityData}
                      {...props}
                  />,
              }}
              {...props}
          />
          {/* Dialog to open when a day is clicked */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent handleClose={handleDialogClose}>
                  <DialogTitle>Selected Day</DialogTitle>
                  <DialogDescription>
                      You selected {selectedDay?.toLocaleDateString()}
                  </DialogDescription>
                  <button
                      className={cn(buttonVariants({variant: "outline"}))}
                      onClick={() => setIsDialogOpen(false)}
                  >
                      Close
                  </button>
              </DialogContent>
          </Dialog>
      </>
  )
}
Calendar.displayName = "Calendar"

const CustomDayCell = ({ date, ...props }: DayProps) => {

    return (
        <button
            className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 font-normal text-sm", // Adjust styles as needed
            )}
            {...props}
        >
            {date.getDate()}
        </button>
    );
};

export default CustomDayCell;

export { Calendar }

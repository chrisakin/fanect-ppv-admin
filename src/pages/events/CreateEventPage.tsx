import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "../../components/ui/dialog";
import { X, UploadIcon, PlusIcon, TrashIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { Currency, IPrice } from "../../types/event";
import { CustomDatePicker } from "../../components/ui/custom-date-picker";
import { CustomTimePicker } from "../../components/ui/custom-time-picker";
import { useToast } from "../../components/ui/use-toast";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any;
}

interface FormData {
  name: string;
  date: Date | null;
  time: string;
  description: string;
  prices: IPrice[];
  haveBroadcastRoom: string;
  broadcastSoftware: string;
  scheduledTestDate: Date | null;
  bannerUrl: File | null;
  watermarkUrl: File | null;
  eventTrailer: File | null;
}

interface FormErrors {
  name?: string;
  date?: string;
  time?: string;
  description?: string;
  prices?: string;
  haveBroadcastRoom?: string;
  broadcastSoftware?: string;
  scheduledTestDate?: string;
  bannerUrl?: string;
  watermarkUrl?: string;
  eventTrailer?: string;
}

export const EventModal = ({ open, onOpenChange, event }: EventModalProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    date: null,
    time: "",
    description: "",
    prices: [{ currency: Currency.NONE, amount: 0 }],
    haveBroadcastRoom: "",
    broadcastSoftware: "",
    scheduledTestDate: null,
    bannerUrl: null,
    watermarkUrl: null,
    eventTrailer: null,
  });
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { updateEvent, fetchMyEvents} = useEventStore();

  // Currency options
  const currencies = Object.values(Currency);

  useEffect(() => {
    if (event) {
      try {
        const eventDate = event.date ? new Date(event.date) : null;
        const scheduledDate = event.scheduledTestDate ? new Date(event.scheduledTestDate) : null;
        setFormData({
          name: event.name || "",
          date: eventDate,
          time: event.time || "",
          description: event.description || "",
          prices: event.prices || [{ currency: Currency.NONE, amount: Number(event.price) || 0 }],
          haveBroadcastRoom: event.haveBroadcastRoom == true ? "yes" : "no" ,
          broadcastSoftware: event.broadcastSoftware || "",
          scheduledTestDate: scheduledDate,
          bannerUrl: null,
          watermarkUrl: null,
          eventTrailer: null,
        });
        setImagePreviews({
          bannerUrl: event.bannerUrl || "",
          watermarkUrl: event.watermarkUrl || "",
          eventTrailer: event.trailerUrl || "",
        });
      } catch (error) {
        console.error('Error setting form data:', error);
      }
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace('event-', '') as keyof FormData;
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };


  const handleDateChange = (field: 'date' | 'scheduledTestDate', date: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleTimeChange = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      time,
    }));
    if (errors.time) {
      setErrors((prev) => ({
        ...prev,
        time: undefined,
      }));
    }
  };

  const handlePriceChange = (index: number, field: 'currency' | 'amount', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.map((price, i) => 
        i === index 
          ? { ...price, [field]: field === 'amount' ? Number(value) : value }
          : price
      )
    }));
    if (errors.prices) {
      setErrors((prev) => ({
        ...prev,
        prices: undefined,
      }));
    }
  };

  const addPrice = () => {
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, { currency: Currency.NONE, amount: 0 }]
    }));
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData((prev) => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = fieldName === 'eventTrailer';
      const validType = isVideo ? file.type.startsWith('video/') : file.type.startsWith('image/');
      
      if (validType) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: file,
        }));
        setErrors((prev) => ({
          ...prev,
          [fieldName]: undefined,
        }));
        
        // Generate preview for images only
        if (!isVideo) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews((prev) => ({
              ...prev,
              [fieldName]: reader.result as string,
            }));
          };
          reader.readAsDataURL(file);
        } else {
          // For videos, just set a placeholder or file name
          setImagePreviews((prev) => ({
            ...prev,
            [fieldName]: file.name,
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: isVideo ? "Please upload a video file" : "Please upload an image file",
        }));
      }
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    }

    if (!formData.time) {
      newErrors.time = "Event time is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.prices.length === 0 || formData.prices.some(p => p.amount <= 0)) {
      newErrors.prices = "At least one valid price is required";
    }

    if (!formData.haveBroadcastRoom) {
      newErrors.haveBroadcastRoom = "Please select if you have a broadcast room";
    }

    if (!formData.broadcastSoftware.trim()) {
      newErrors.broadcastSoftware = "Broadcast software information is required";
    }

    if (!formData.scheduledTestDate) {
      newErrors.scheduledTestDate = "Test stream date is required";
    }

    if (!event && !formData.bannerUrl) {
      newErrors.bannerUrl = "Event banner is required";
    }

    // if (!event && !formData.watermarkUrl) {
    //   newErrors.watermarkUrl = "Event watermark is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateStep2()) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        
        if (formData.date) {
          formDataToSend.append('date', formData.date as unknown as string);
        }
        
        formDataToSend.append('time', formData.time);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('prices', JSON.stringify(formData.prices));
        formDataToSend.append('haveBroadcastRoom', formData.haveBroadcastRoom);
        formDataToSend.append('broadcastSoftware', formData.broadcastSoftware);
        
        if (formData.scheduledTestDate) {
          formDataToSend.append('scheduledTestDate', formData.scheduledTestDate as unknown as string);
        }
        
        if (formData.bannerUrl) {
          formDataToSend.append('banner', formData.bannerUrl);
        }
        if (formData.watermarkUrl) {
          formDataToSend.append('watermark', formData.watermarkUrl);
        }
        if (formData.eventTrailer) {
          formDataToSend.append('trailer', formData.eventTrailer);
        }

        if (event) {
          await updateEvent(event._id, formDataToSend);
          toast({
            title: "Success",
            description: "Event updated successfully",
          });
        } else {
          await axios.post('/events', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast({
            title: "Success",
            description: "Event created successfully",
          });
        }
        await fetchMyEvents()
        onOpenChange(false);
        setCurrentStep(1);
        setFormData({
          name: "",
          date: null,
          time: "",
          description: "",
          prices: [{ currency: Currency.NONE, amount: 0 }],
          haveBroadcastRoom: "",
          broadcastSoftware: "",
          scheduledTestDate: null,
          bannerUrl: null,
          watermarkUrl: null,
          eventTrailer: null,
        });
        setImagePreviews({});
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to create event",
        });
      }
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    setFormData({
      name: "",
      date: null,
      time: "",
      description: "",
      prices: [{ currency: Currency.NONE, amount: 0 }],
      haveBroadcastRoom: "",
      broadcastSoftware: "",
      scheduledTestDate: null,
      bannerUrl: null,
      watermarkUrl: null,
      eventTrailer: null,
    });
    setImagePreviews({});
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[600px] h-[90vh] p-0 bg-background overflow-y-auto">
        <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
          <Card className="w-full bg-gray-50 dark:!bg-[#02150C] rounded-[10px] border border-solid border-[#d5d7da] dark:border-[#1AAA65]">
            <CardContent className="flex flex-col items-center p-0">
              <DialogClose className="absolute right-4 top-4 z-10 focus-visible:outline-none">
                <X className="h-4 w-4" />
              </DialogClose>

              <div className="flex flex-col w-full max-w-[510px] items-center gap-[28px] py-[45px] px-6">
                {/* Header Section */}
                <div className="flex flex-col w-full max-w-[489px] items-center gap-[20px]">
                  <div className="flex flex-col items-center w-full">
                    <DialogTitle className="text-[40px] text-gray-800 dark:text-[#DDDDDD] text-center tracking-[var(--display-lg-semibold-letter-spacing)] leading-[var(--display-lg-semibold-line-height)]">
                      {event ? 'Edit Event' : 'Organize Event'}
                    </DialogTitle>

                    <DialogDescription className="font-display-xs-regular text-[#717680] dark:text-[#CCCCCC] text-[length:var(--display-xs-regular-font-size)] text-center tracking-[var(--display-xs-regular-letter-spacing)] leading-[var(--display-xs-regular-line-height)]">
                      {event ? 'Update your event details' : 'Enter your event details to create an event'}
                    </DialogDescription>
                  </div>
                  <p className="[font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-[#717680] dark:text-[#CCCCCC] text-lg tracking-[-0.36px]">
                    Step {currentStep} of 2
                  </p>
                </div>

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <>
                    {/* Form Fields */}
                    <div className="flex flex-col items-start gap-6 w-full">
                      {/* Event Name Field */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <label className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Name
                        </label>
                        <div className="relative w-full">
                          <Input
                            id="name"
                            className="h-[50px] px-3.5 py-2.5  dark:bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-[#2E483A] [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px]"
                            placeholder="Enter event name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                          />
                        </div>
                        {errors.name && (
                          <span className="text-xs text-red-500">{errors.name}</span>
                        )}
                      </div>

                      {/* Event Date Field */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <label className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Date
                        </label>
                        <CustomDatePicker
                          value={formData.date}
                          onChange={(date) => handleDateChange('date', date as unknown as string)}
                          placeholder="Select event date"
                          disabled={isSubmitting}
                          className="h-[50px] w-full px-3.5 py-2.5 bg-gray-50 dark:!bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-gray-600 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px]"
                        />
                        {errors.date && (
                          <span className="text-xs text-red-500">{errors.date}</span>
                        )}
                      </div>

                      {/* Event Time Field */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <label className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Time
                        </label>
                        <CustomTimePicker
                          value={formData.time}
                          onChange={handleTimeChange}
                          placeholder="Select event time"
                          disabled={isSubmitting}
                          className="h-[50px] w-full px-3.5 py-2.5 bg-gray-50 dark:!bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-gray-600 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px]"
                        />
                        {errors.time && (
                          <span className="text-xs text-red-500">{errors.time}</span>
                        )}
                      </div>

                      {/* Event Description Field */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <label className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Description
                        </label>
                        <Textarea
                          id="description"
                          className="h-[174px] px-3.5 pt-5 pb-2.5 bg-gray-50 dark:bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-gray-600 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px] resize-none"
                          placeholder="Enter event description. You can use line breaks for paragraphs and format your text as needed."
                          value={formData.description}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          style={{ whiteSpace: 'pre-wrap' }}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tip: Use line breaks to create paragraphs. Your formatting will be preserved.
                        </p>
                        {errors.description && (
                          <span className="text-xs text-red-500">{errors.description}</span>
                        )}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex flex-col items-center w-full">
                      <Button 
                        type="button"
                        onClick={handleContinue}
                        className="h-[50px] w-full bg-green-600 rounded-[10px] font-text-lg-semibold text-white text-[length:var(--text-lg-semibold-font-size)] tracking-[var(--text-lg-semibold-letter-spacing)] leading-[var(--text-lg-semibold-line-height)] hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}

                {/* Step 2: Pricing and Media Upload */}
                {currentStep === 2 && (
                  <>
                    {/* Form Fields */}
                    <div className="flex flex-col items-start gap-6 w-full">
                      {/* Event Pricing */}
                      <div className="flex flex-col items-start gap-4 w-full">
                        <div className="flex items-center justify-between w-full">
                          <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                            Event Pricing
                          </h3>
                          {/* <Button
                            type="button"
                            onClick={addPrice}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Add Currency
                          </Button> */}
                        </div>
                        
                        {formData.prices.map((price, index) => (
                          <div key={index} className="flex items-start gap-2 w-full">
                            <div className="w-[120px] h-[50px] flex items-center bg-gray-50 dark:bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-gray-600">
                              {/* <Input
                                value={price.currency}
                                disabled
                                className="w-full h-full border-0 bg-transparent text-center font-medium"
                              /> */}
                              <Select value={price.currency} onValueChange={(value) => handlePriceChange(index, "currency", value)}>
                              <SelectTrigger className="w-full h-full border-0 bg-transparent cursor-pointer">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="cursor-pointer dark:!bg-[#FFFFFF]">
                                {currencies.map((currency) => {
                                  const isSelected = formData.prices.some(
                                    (p, i) => p.currency === currency && i !== index
                                  );
                                  return (
                                    <SelectItem
                                      key={currency}
                                      value={currency}
                                      disabled={isSelected}
                                      className="!cursor-pointer dark:!text-[#000000] dark:hover:bg-[#13201A] dark:hover:!text-[#FFFFFF] hover:bg-[#13201A] hover:text-[#FFFFFF]"
                                    >
                                      {currency}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            </div>

                            <div className="flex-1 h-[50px] bg-gray-50 dark:bg-[#13201A] rounded-lg">
                              <div className="flex items-center justify-between  h-full">
                                {/* <Input
                                  type="number"
                                  className="!border-0 bg-gray-50 dark:bg-[#13201A] text-gray-700 dark:text-gray-200 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.32px] shadow-none p-0 h-full focus:!outline-none focus:!ring-0 focus-visible:!outline-none !appearance-none"
                                  placeholder="Enter amount"
                                  value={price.amount|| ''}
                                  onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                                  disabled={isSubmitting}
                                /> */}
                                 <Input
                                  id="amount"
                                  type="number"
                                  className="h-[50px] px-3.5 py-2.5  dark:bg-[#13201A] rounded-lg [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px]"
                                  placeholder="Enter amount"
                                  value={price.amount|| ''}
                                  onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                                  disabled={isSubmitting}
                                  />
                              </div>
                            </div>

                            {formData.prices.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removePrice(index)}
                                variant="outline"
                                size="sm"
                                className="h-[50px] w-[60px] p-0 border-red-300 text-red-500 hover:bg-red-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {errors.prices && (
                          <span className="text-xs text-red-500">{errors.prices}</span>
                        )}
                      </div>

                      {/* Broadcast Room Question */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Do you have a broadcast room?
                        </h3>

                        <Select value={formData.haveBroadcastRoom} onValueChange={(value) => handleSelectChange('haveBroadcastRoom', value)}>
                          <SelectTrigger className="h-[50px] bg-gray-50 dark:bg-[#13201A] border-[#d5d7da] dark:border-gray-600 w-full cursor-pointer">
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent className="cursor-pointer dark:!bg-[#FFFFFF]">
                            <SelectItem className="!cursor-pointer dark:!text-[#000000] dark:hover:bg-[#13201A] dark:hover:!text-[#FFFFFF] hover:bg-[#13201A] hover:text-[#FFFFFF]" value="yes">Yes</SelectItem>
                            <SelectItem className="!cursor-pointer dark:!text-[#000000] dark:hover:bg-[#13201A] dark:hover:!text-[#FFFFFF] hover:bg-[#13201A] hover:text-[#FFFFFF]"  value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.haveBroadcastRoom && (
                          <span className="text-xs text-red-500">{errors.haveBroadcastRoom}</span>
                        )}
                      </div>

                      {/* Broadcast Software */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          What broadcast software will you be using?
                        </h3>

                        <Textarea
                          id="broadcastSoftware"
                          className="h-[94px] bg-gray-50 dark:bg-[#13201A] border-[#d5d7da] dark:border-gray-600 rounded-lg pt-5 pb-2.5 px-3.5 text-gray-700 dark:text-gray-200 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.32px] resize-none"
                          placeholder="Enter answer"
                          value={formData.broadcastSoftware}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        {errors.broadcastSoftware && (
                          <span className="text-xs text-red-500">{errors.broadcastSoftware}</span>
                        )}
                      </div>

                      {/* Test Stream Date */}
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Schedule Test Stream with FaNect Support
                        </h3>

                        <CustomDatePicker
                          value={formData.scheduledTestDate}
                          onChange={(date) => handleDateChange('scheduledTestDate', date as unknown as string)}
                          placeholder="Select test stream date"
                          disabled={isSubmitting}
                          className="h-[50px] w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#13201A] rounded-lg border border-solid border-[#d5d7da] dark:border-gray-600 [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-gray-700 dark:text-gray-200 text-base tracking-[-0.32px]"
                        />
                        {errors.scheduledTestDate && (
                          <span className="text-xs text-red-500">{errors.scheduledTestDate}</span>
                        )}
                      </div>

                      {/* Event Banner Upload */}
                      <div className="flex flex-col w-full h-[165px] items-start gap-1.5">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Banner
                        </h3>

                        <label htmlFor="bannerUrl" className="cursor-pointer w-full">
                          <div className="h-[133px] flex items-center justify-center w-full bg-gray-50 dark:bg-[#13201A] rounded-lg border border-dashed border-[#a4a7ae] dark:border-gray-600 shadow-shadow-xs hover:border-green-600 transition-colors">
                            <div className="flex flex-col w-[157px] items-center justify-center gap-2.5">
                              {imagePreviews.bannerUrl ? (
                                <img
                                  src={imagePreviews.bannerUrl}
                                  alt="Banner Preview"
                                  className="w-full h-[120px] object-contain rounded"
                                />
                              ) : (
                                <>
                                  <UploadIcon className="w-6 h-6 text-green-600" />
                                  <span className="text-green-600 whitespace-nowrap [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.32px]">
                                    Upload event banner
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <input
                            id="bannerUrl"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'bannerUrl')}
                            disabled={isSubmitting}
                          />
                        </label>
                        {errors.bannerUrl && (
                          <span className="text-xs text-red-500">{errors.bannerUrl}</span>
                        )}
                      </div>

                      {/* Event Watermark Upload */}
                      <div className="flex flex-col w-full h-[165px] items-start gap-1.5">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Custom Watermark (this could be your logo)
                        </h3>

                        <label htmlFor="watermarkUrl" className="cursor-pointer w-full">
                          <div className="h-[133px] flex items-center justify-center w-full bg-gray-50 dark:bg-[#13201A] rounded-lg border border-dashed border-[#a4a7ae] dark:border-gray-600 shadow-shadow-xs hover:border-green-600 transition-colors">
                            <div className="flex flex-col w-[157px] items-center justify-center gap-2.5">
                              {imagePreviews.watermarkUrl ? (
                                <img
                                  src={imagePreviews.watermarkUrl}
                                  alt="Watermark Preview"
                                  className="w-full h-[120px] object-contain rounded"
                                />
                              ) : (
                                <>
                                  <UploadIcon className="w-6 h-6 text-green-600" />
                                  <span className="text-green-600 whitespace-nowrap [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.32px]">
                                    Upload watermark
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <input
                            id="watermarkUrl"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'watermarkUrl')}
                            disabled={isSubmitting}
                          />
                        </label>
                        {errors.watermarkUrl && (
                          <span className="text-xs text-red-500">{errors.watermarkUrl}</span>
                        )}
                      </div>

                      {/* Event Trailer Upload */}
                      <div className="flex flex-col w-full h-[165px] items-start gap-1.5">
                        <h3 className="font-text-lg-medium text-gray-800 dark:text-[#CCCCCC] text-[length:var(--text-lg-medium-font-size)] tracking-[var(--text-lg-medium-letter-spacing)] leading-[var(--text-lg-medium-line-height)]">
                          Event Trailer
                        </h3>

                        <label htmlFor="eventTrailer" className="cursor-pointer w-full">
                          <div className="h-[133px] flex items-center justify-center w-full bg-gray-50 dark:bg-[#13201A] rounded-lg border border-dashed border-[#a4a7ae] dark:border-gray-600 shadow-shadow-xs hover:border-green-600 transition-colors">
                            <div className="flex flex-col w-[157px] items-center justify-center gap-2.5">
                              {imagePreviews.eventTrailer ? (
                                <div className="flex flex-col items-center gap-2">
                                  <UploadIcon className="w-6 h-6 text-green-600" />
                                  <span className="text-green-600 text-xs text-center">
                                    {imagePreviews.eventTrailer}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <UploadIcon className="w-6 h-6 text-green-600" />
                                  <span className="text-green-600 whitespace-nowrap [font-family:'Sofia_Pro-Regular',Helvetica] font-normal text-base tracking-[-0.32px]">
                                    Upload event trailer
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <input
                            id="eventTrailer"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'eventTrailer')}
                            disabled={isSubmitting}
                          />
                        </label>
                        {errors.eventTrailer && (
                          <span className="text-xs text-red-500">{errors.eventTrailer}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-center gap-4 w-full">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-[50px] w-full bg-green-600 rounded-[10px] font-text-lg-semibold text-white text-[length:var(--text-lg-semibold-font-size)] tracking-[var(--text-lg-semibold-letter-spacing)] leading-[var(--text-lg-semibold-line-height)] hover:bg-green-700"
                      >
                        {isSubmitting ? 
                          (event ? "Updating Event..." : "Creating Event...") : 
                          (event ? "Update Event" : "Create Event")
                        }
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="h-[50px] w-full border-[#d5d7da] dark:border-gray-600 rounded-[10px] font-text-lg-semibold text-gray-700 dark:text-gray-200 text-[length:var(--text-lg-semibold-font-size)] tracking-[var(--text-lg-semibold-letter-spacing)] leading-[var(--text-lg-semibold-line-height)]"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
};
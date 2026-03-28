import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Loader2, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINTS, getApiHeaders } from "@/config/api";
import { STATE_DISCOMS } from "@/config/discoms";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYXN0cm95YXNoNDQiLCJhIjoiY21jdzl5MjYwMDA4cjJpb25leWp4M3J3eCJ9.cdANZNWr5UGQ_eCH52XoNg";

const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone_number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    consumer_number: z.string().regex(/^\d{10,13}$/, "Consumer number must be between 10 to 13 digits"),
    location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
    discom: z.string().min(1, "DISCOM is required").max(100, "DISCOM must be less than 100 characters"),
});

export default function Register() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [detectedState, setDetectedState] = useState<string | null>(null);

    const [viewState, setViewState] = useState({
        longitude: 77.209,
        latitude: 28.6139,
        zoom: 4
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            username: "",
            password: "",
            phone_number: "",
            consumer_number: "",
            location: "",
            discom: "",
        },
    });

    const handleLocationDetection = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Geolocation not supported",
                description: "Your browser does not support geolocation.",
                variant: "destructive",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setViewState({ longitude, latitude, zoom: 12 });

                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch location data");
                    const data = await response.json();

                    let city = "";
                    let region = "";

                    // Mapbox features array contains place/region/country etc.
                    for (const feature of data.features) {
                        if (feature.id.startsWith("place")) {
                            city = feature.text;
                        } else if (feature.id.startsWith("region")) {
                            region = feature.text;
                        }
                    }

                    if (city) {
                        form.setValue("location", city, { shouldValidate: true });
                    } else {
                        // fallback if place is not found, use whatever the most granular place is
                        form.setValue("location", data.features[0]?.place_name?.split(",")[0] || "", { shouldValidate: true });
                    }

                    if (region) {
                        // Find if standard states match mapbox region
                        const stateMatch = Object.keys(STATE_DISCOMS).find(
                            (s) => s.toLowerCase() === region.toLowerCase() || region.toLowerCase().includes(s.toLowerCase())
                        );

                        if (stateMatch) {
                            setDetectedState(stateMatch);
                            // reset discom if state changed
                            form.setValue("discom", "", { shouldValidate: true });
                        }
                    }
                } catch (error) {
                    toast({
                        title: "Location Detection Failed",
                        description: "Could not resolve your location details. Please enter manually.",
                        variant: "destructive",
                    });
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                toast({
                    title: "Permission Denied",
                    description: "Could not access your location.",
                    variant: "destructive",
                });
            }
        );
    };

    const getAvailableDiscoms = useCallback(() => {
        if (detectedState) {
            return STATE_DISCOMS[detectedState] || [];
        }
        // If no state detected, return all options across India for manual selection
        return Object.values(STATE_DISCOMS).flat().sort();
    }, [detectedState]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.register(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getApiHeaders()
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                let errorMsg = "Registration failed";
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.detail || errorData.message || errorMsg;
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            toast({
                title: "Registration successful!",
                description: "You have securely registered.",
            });

            // You might want to save data.access_token to localStorage here
            localStorage.setItem("access_token", data.access_token);

            // Redirect to home or dashboard
            navigate("/");
        } catch (error: any) {
            toast({
                title: "Registration Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4 py-8">
            <Card className="w-full max-w-2xl shadow-lg border-primary/10">
                <CardHeader className="space-y-1 bg-primary/5 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-primary" />
                        Candidate Registration
                    </CardTitle>
                    <CardDescription>
                        Register your details along with your exact location and DISCOM.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="johndoe123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="consumer_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consumer Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Location Tracking</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLocationDetection}
                                        disabled={isLocating}
                                        className="gap-2"
                                    >
                                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                                        Detect My Location
                                    </Button>
                                </div>

                                <div className="h-48 rounded-md overflow-hidden ring-1 ring-border">
                                    <Map
                                        {...viewState}
                                        onMove={evt => setViewState(evt.viewState)}
                                        mapStyle="mapbox://styles/mapbox/streets-v12"
                                        mapboxAccessToken={MAPBOX_TOKEN}
                                        attributionControl={false}
                                    >
                                        <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="bottom">
                                            <MapPin className="h-8 w-8 text-primary drop-shadow-md" fill="currentColor" />
                                        </Marker>
                                    </Map>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City / Area {detectedState ? `(${detectedState})` : ""}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ahmedabad"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            // Allow users to reset detected state indirectly to re-enable global DISCOM search
                                                            if (!e.target.value) setDetectedState(null);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="discom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Distribution Company (DISCOM)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select DISCOM" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {getAvailableDiscoms().map((discomName) => (
                                                            <SelectItem key={discomName} value={discomName}>
                                                                {discomName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Register Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

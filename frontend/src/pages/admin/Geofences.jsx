import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, PolygonF, MarkerF } from "@react-google-maps/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiInstance from "../../utils/apiInstance";
import { PageHeader, TableCard, Modal } from "../../components/common/PageTable";

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "12px",
};

// Default map center (Surat coordinates as center since it is used in screenshots)
const defaultCenter = {
  lat: 21.1702,
  lng: 72.8311,
};

const GOOGLE_MAPS_LIBRARIES = ["drawing", "places"];

const Geofences = () => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation / Views
  const [viewMode, setViewMode] = useState("list"); // list, edit
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Modals / Dropdowns
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [viewLocationModal, setViewLocationModal] = useState({ isOpen: false, location: null });
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Main Location Fields
  const [locationName, setLocationName] = useState("");
  const [locationStatus, setLocationStatus] = useState(true);

  // Nested form state
  const [activeForm, setActiveForm] = useState(""); // "", "city", "area", "pincode"
  
  // City Form State
  const [editingCityId, setEditingCityId] = useState(null);
  const [cityName, setCityName] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [cityState, setCityState] = useState("");
  const [cityAddress, setCityAddress] = useState("");
  const [cityStatus, setCityStatus] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState([]);

  // Data Options (Vehicle Services & Subscription Passes)
  const [availableServices, setAvailableServices] = useState([]);
  const [availableSubscriptions, setAvailableSubscriptions] = useState([]);

  // Fetch available services and subscription passes
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        const [servicesRes, subsRes] = await Promise.all([
          apiInstance.get("/vehicles/services"),
          apiInstance.get("/subscriptions?all=true")
        ]);
        if (servicesRes.data?.body) {
          setAvailableServices(servicesRes.data.body);
        }
        if (subsRes.data?.body?.list) {
          setAvailableSubscriptions(subsRes.data.body.list);
        }
      } catch (err) {
        console.error("Error loading services & subscriptions options:", err);
      }
    };
    fetchOptionsData();
  }, []);

  // Area Form State
  const [areaName, setAreaName] = useState("");
  const [areaStatus, setAreaStatus] = useState(true);
  const [drawnCoordinates, setDrawnCoordinates] = useState([]);
  const [highlightedAreaId, setHighlightedAreaId] = useState(null);
  
  // Pincode Form State
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [pincodeVal, setPincodeVal] = useState("");
  const [pincodeName, setPincodeName] = useState("");
  const [pincodeCity, setPincodeCity] = useState("");
  const [pincodeState, setPincodeState] = useState("");
  const [pincodeCountry, setPincodeCountry] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(true);

  // Map settings
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  // Refs for Google Autocomplete inputs
  const cityAutocompleteRef = useRef(null);
  const pincodeAutocompleteRef = useRef(null);
  const cityInputRef = useRef(null);
  const pincodeInputRef = useRef(null);

  // Google Maps API Loader
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAP_CLIENT_ID || "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleMapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Geocode city and center map helper
  const geocodeAndCenterCity = (cityName) => {
    if (!isLoaded || !cityName) return;
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({
            lat: location.lat(),
            lng: location.lng()
          });
          setMapZoom(13);
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // Auto-center map when drawing area based on location's cities
  useEffect(() => {
    if (activeForm === "area" && selectedLocation?.cities?.length > 0) {
      geocodeAndCenterCity(selectedLocation.cities[0].name);
    }
  }, [activeForm, selectedLocation]);

  // Fetch all locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/geofences?search=${searchQuery}`);
      if (res.data.success) {
        setLocations(res.data.body.list);
      } else {
        toast.error(res.data.message || "Failed to fetch locations");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchQuery]);

  // Load a single location for edit view
  const loadLocationForEdit = async (id) => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/geofences/${id}`);
      if (res.data.success) {
        const loc = res.data.body;
        setSelectedLocation(loc);
        setLocationName(loc.name);
        setLocationStatus(loc.is_active === 1);
        
        // Center map to first available city or area coordinates
        if (loc.cities && loc.cities.length > 0) {
          // If cities exist, geocode or check address
          // Use default center for now
        }
        
        // Reset sub forms
        setActiveForm("");
        setDrawnCoordinates([]);
        setViewMode("edit");
      } else {
        toast.error(res.data.message || "Failed to load location details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading location");
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete helpers
  const parseAddressComponents = (place) => {
    const result = {
      pincode: "",
      city: "",
      state: "",
      country: "",
      address: place.formatted_address || ""
    };
    
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes("postal_code")) {
          result.pincode = component.long_name;
        }
        if (types.includes("locality") || types.includes("sublocality") || types.includes("administrative_area_level_3")) {
          result.city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          result.state = component.long_name;
        }
        if (types.includes("country")) {
          result.country = component.long_name;
        }
      }
    }
    return result;
  };

  // Bind Google Autocomplete when forms are active
  useEffect(() => {
    if (isLoaded && activeForm === "city" && cityInputRef.current) {
      cityAutocompleteRef.current = new window.google.maps.places.Autocomplete(cityInputRef.current, {
        types: ["(cities)"]
      });

      cityAutocompleteRef.current.addListener("place_changed", () => {
        const place = cityAutocompleteRef.current.getPlace();
        if (place && place.address_components) {
          const parsed = parseAddressComponents(place);
          setCityName(parsed.city || place.name || "");
          setCityCountry(parsed.country || "");
          setCityState(parsed.state || "");
          setCityAddress(parsed.address || "");
          
          if (place.geometry && place.geometry.location) {
            setMapCenter({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });
            setMapZoom(13);
          }
        }
      });
    }

    if (isLoaded && activeForm === "pincode" && pincodeInputRef.current) {
      pincodeAutocompleteRef.current = new window.google.maps.places.Autocomplete(pincodeInputRef.current, {
        types: ["(regions)"]
      });

      pincodeAutocompleteRef.current.addListener("place_changed", () => {
        const place = pincodeAutocompleteRef.current.getPlace();
        if (place && place.address_components) {
          const parsed = parseAddressComponents(place);
          
          setPincodeVal(parsed.pincode || "");
          setPincodeName(parsed.city || place.name || "");
          setPincodeCity(parsed.city || "");
          setPincodeState(parsed.state || "");
          setPincodeCountry(parsed.country || "");
          setPincodeSearch(parsed.pincode || place.name || "");
        }
      });
    }
  }, [isLoaded, activeForm]);

  // Main Location Handlers
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!locationName.trim()) {
      toast.error("Location Name is required");
      return;
    }

    try {
      const res = await apiInstance.post("/geofences", {
        name: locationName,
        is_active: 1
      });

      if (res.data.success) {
        toast.success("Location added successfully");
        setShowAddLocationModal(false);
        fetchLocations();
        // Automatically open edit view for the newly created location
        loadLocationForEdit(res.data.body.id);
      } else {
        toast.error(res.data.message || "Failed to create location");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating location");
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    if (!locationName.trim()) {
      toast.error("Location Name is required");
      return;
    }

    try {
      const res = await apiInstance.put(`/geofences/${selectedLocation.id}`, {
        name: locationName,
        is_active: locationStatus ? 1 : 0
      });

      if (res.data.success) {
        toast.success("Location settings updated");
        loadLocationForEdit(selectedLocation.id);
      } else {
        toast.error(res.data.message || "Failed to update location");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating location");
    }
  };

  const handleToggleLocationStatus = async (id) => {
    try {
      const res = await apiInstance.put(`/geofences/status/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchLocations();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error toggling status");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Location and all its sub-boundaries?")) return;
    try {
      const res = await apiInstance.delete(`/geofences/${id}`);
      if (res.data.success) {
        toast.success("Location deleted successfully");
        fetchLocations();
        if (selectedLocation && selectedLocation.id === id) {
          setViewMode("list");
          setSelectedLocation(null);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error deleting location");
    }
  };

  // City sub-entity handlers
  const handleSaveCity = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) {
      toast.error("City Name is required");
      return;
    }

    const payload = {
      name: cityName,
      country: cityCountry,
      state: cityState,
      address: cityAddress,
      is_active: cityStatus ? 1 : 0,
      service_ids: selectedServiceIds,
      subscription_ids: selectedSubscriptionIds
    };

    try {
      let res;
      if (editingCityId) {
        res = await apiInstance.put(`/geofences/cities/${editingCityId}`, payload);
      } else {
        res = await apiInstance.post(`/geofences/${selectedLocation.id}/cities`, payload);
      }

      if (res.data.success) {
        toast.success(editingCityId ? "City updated successfully" : "City added successfully");
        setActiveForm("");
        setEditingCityId(null);
        loadLocationForEdit(selectedLocation.id);
        
        // Reset state
        setCityName("");
        setCityCountry("");
        setCityState("");
        setCityAddress("");
        setSelectedServiceIds([]);
        setSelectedSubscriptionIds([]);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error saving city");
    }
  };

  const parseIds = (val) => {
    if (!val) return [];
    let arr = val;
    if (typeof val === "string") {
      try {
        arr = JSON.parse(val);
      } catch (e) {
        arr = [];
      }
    }
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => Number(x)).filter((x) => !isNaN(x));
  };

  const handleEditCity = (city) => {
    setActiveForm("city");
    setEditingCityId(city.id);
    setCityName(city.name || "");
    setCityCountry(city.country || "");
    setCityState(city.state || "");
    setCityAddress(city.address || "");
    setCityStatus(city.is_active === 1);
    setSelectedServiceIds(parseIds(city.service_ids));
    setSelectedSubscriptionIds(parseIds(city.subscription_ids));
    geocodeAndCenterCity(city.name);
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return;
    try {
      const res = await apiInstance.delete(`/geofences/cities/${cityId}`);
      if (res.data.success) {
        toast.success("City removed");
        loadLocationForEdit(selectedLocation.id);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error deleting city");
    }
  };

  // Area drawing and polygon handlers
  const handleMapClick = (e) => {
    if (activeForm === "area" && e.latLng) {
      const newCoord = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setDrawnCoordinates((prev) => [...prev, newCoord]);
    }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!areaName.trim()) {
      toast.error("Area Name is required");
      return;
    }
    if (drawnCoordinates.length < 3) {
      toast.error("Please draw a valid area boundary (at least 3 points) on the map");
      return;
    }

    try {
      const res = await apiInstance.post(`/geofences/${selectedLocation.id}/areas`, {
        name: areaName,
        coordinates: drawnCoordinates,
        is_active: areaStatus ? 1 : 0
      });

      if (res.data.success) {
        toast.success("Area boundary added successfully");
        setActiveForm("");
        loadLocationForEdit(selectedLocation.id);
        
        setAreaName("");
        setDrawnCoordinates([]);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error adding area boundary");
    }
  };

  const handleDeleteArea = async (areaId) => {
    if (!window.confirm("Are you sure you want to delete this area?")) return;
    try {
      const res = await apiInstance.delete(`/geofences/areas/${areaId}`);
      if (res.data.success) {
        toast.success("Area boundary removed");
        loadLocationForEdit(selectedLocation.id);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error deleting area");
    }
  };

  // Pincode sub-entity handlers
  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!pincodeVal.trim()) {
      toast.error("Pincode value is required");
      return;
    }

    try {
      const res = await apiInstance.post(`/geofences/${selectedLocation.id}/pincodes`, {
        pincode: pincodeVal,
        city: pincodeName || pincodeCity,
        state: pincodeState,
        country: pincodeCountry,
        is_active: pincodeStatus ? 1 : 0
      });

      if (res.data.success) {
        toast.success("Pincode added successfully");
        setActiveForm("");
        loadLocationForEdit(selectedLocation.id);
        
        setPincodeVal("");
        setPincodeName("");
        setPincodeCity("");
        setPincodeState("");
        setPincodeCountry("");
        setPincodeSearch("");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error adding pincode");
    }
  };

  const handleDeletePincode = async (pincodeId) => {
    if (!window.confirm("Are you sure you want to delete this pincode?")) return;
    try {
      const res = await apiInstance.delete(`/geofences/pincodes/${pincodeId}`);
      if (res.data.success) {
        toast.success("Pincode removed");
        loadLocationForEdit(selectedLocation.id);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Error deleting pincode");
    }
  };

  // Rendering Functions
  const renderListView = () => {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "var(--text)" }}>Location Management</h4>
            <p className="text-muted mb-0">Manage active markets, zones, and usage fees</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={() => {
              setLocationName("");
              setLocationStatus(true);
              setShowAddLocationModal(true);
            }}
            style={{ background: "var(--grad-btn)", border: "none", boxShadow: "var(--shadow-btn)" }}
          >
            <i className="material-icons" style={{ fontSize: "20px" }}>add</i>
            Add Location
          </button>
        </div>

        <div className="mb-4 d-flex justify-content-between align-items-center gap-3">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="material-icons text-muted">search</i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TableCard>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-0">Name</th>
                  <th className="px-4 py-3 border-0 text-center">Cities</th>
                  <th className="px-4 py-3 border-0 text-center">Areas</th>
                  <th className="px-4 py-3 border-0 text-center">Pincodes</th>
                  <th className="px-4 py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-center">Pass Details</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="px-4 py-3">
                      <strong>{loc.name}</strong>
                    </td>
                    <td className="px-4 py-3 text-center text-muted fw-bold">
                      {loc.cities ? loc.cities.length : 0}
                    </td>
                    <td className="px-4 py-3 text-center text-muted fw-bold">
                      {loc.areas ? loc.areas.length : 0}
                    </td>
                    <td className="px-4 py-3 text-center text-muted fw-bold">
                      {loc.pincodes ? loc.pincodes.length : 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={loc.is_active === 1}
                          onChange={() => handleToggleLocationStatus(loc.id)}
                          style={{ cursor: "pointer", width: "36px", height: "18px" }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        className="btn btn-sm btn-light text-primary border" 
                        onClick={() => setViewLocationModal({ isOpen: true, location: loc })}
                        title="View Pass & City Details"
                        style={{ borderRadius: "8px", fontWeight: "600", fontSize: "12px", background: "#f8fafc" }}
                      >
                        <i className="material-icons me-1" style={{ fontSize: "16px", verticalAlign: "middle" }}>visibility</i>
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button 
                        className="btn btn-sm btn-light me-2" 
                        onClick={() => loadLocationForEdit(loc.id)}
                        title="Edit Location Boundaries"
                      >
                        <i className="material-icons" style={{ fontSize: "18px", color: "var(--p-pink)" }}>edit</i>
                      </button>
                      <button 
                        className="btn btn-sm btn-light" 
                        onClick={() => handleDeleteLocation(loc.id)}
                        title="Delete Location"
                      >
                        <i className="material-icons" style={{ fontSize: "18px", color: "#ef4444" }}>delete</i>
                      </button>
                    </td>
                  </tr>
                ))}
                {locations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="material-icons d-block mb-2" style={{ fontSize: "36px" }}>location_off</i>
                      No locations found. Click "Add Location" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TableCard>
      </>
    );
  };

  const renderEditView = () => {
    if (!selectedLocation) return null;

    // Compile listing of all nested items
    const citiesList = selectedLocation.cities || [];
    const areasList = selectedLocation.areas || [];
    const pincodesList = selectedLocation.pincodes || [];
    const hasAnySubEntity = citiesList.length > 0 || areasList.length > 0 || pincodesList.length > 0;

    return (
      <>
        {/* Header with back navigation */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-light btn-sm d-flex align-items-center" onClick={() => setViewMode("list")}>
              <i className="material-icons" style={{ fontSize: "18px" }}>arrow_back</i>
            </button>
            <h4 className="fw-bold mb-0" style={{ color: "var(--text)" }}>EDIT LOCATION</h4>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Location details & menu boundary listings */}
          <div className="col-12 col-lg-4">
            {/* Update Location details Card */}
            <div className="card mb-4" style={{ border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow-card)", background: "white" }}>
              <div className="card-body p-4">
                <form onSubmit={handleUpdateLocation}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>Name *</label>
                    <input 
                      type="text" 
                      className="form-control p-2" 
                      value={locationName} 
                      onChange={(e) => setLocationName(e.target.value)} 
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-muted d-block" style={{ fontSize: "12px" }}>Status</label>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        checked={locationStatus} 
                        onChange={(e) => setLocationStatus(e.target.checked)}
                        style={{ width: "36px", height: "18px", cursor: "pointer" }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4 py-2"
                      style={{ background: "var(--grad-btn)", border: "none", borderRadius: "8px", fontWeight: "600" }}
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Boundary addition listings card */}
            <div className="card" style={{ border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow-card)", background: "white" }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 position-relative">
                  <h5 className="fw-bold mb-0" style={{ fontSize: "15px" }}>Add</h5>
                  <div>
                    <button 
                      className="btn btn-light d-flex align-items-center justify-content-center p-2" 
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      style={{ borderRadius: "8px", background: "#eef2f6", border: "none" }}
                    >
                      <i className="material-icons" style={{ fontSize: "20px", color: "var(--p-pink)" }}>add</i>
                    </button>
                    
                    {/* Add options dropdown */}
                    {showAddMenu && (
                      <div className="position-absolute end-0 mt-2 bg-white shadow rounded border p-1" style={{ zIndex: 100, minWidth: "120px" }}>
                        <button 
                          className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
                          onClick={() => {
                            setActiveForm("city");
                            setEditingCityId(null);
                            setCityName("");
                            setCityCountry("");
                            setCityState("");
                            setCityAddress("");
                            setCityStatus(true);
                            setSelectedServiceIds([]);
                            setSelectedSubscriptionIds([]);
                            setShowAddMenu(false);
                          }}
                          style={{ border: "none", background: "none", width: "100%", borderRadius: "6px" }}
                        >
                          <span className="badge rounded-circle p-1" style={{ background: "#4f46e5", width: "8px", height: "8px", display: "inline-block" }}></span>
                          City
                        </button>
                        <button 
                          className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
                          onClick={() => {
                            setActiveForm("area");
                            setShowAddMenu(false);
                          }}
                          style={{ border: "none", background: "none", width: "100%", borderRadius: "6px" }}
                        >
                          <span className="badge rounded-circle p-1" style={{ background: "#10b981", width: "8px", height: "8px", display: "inline-block" }}></span>
                          Area
                        </button>
                        <button 
                          className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
                          onClick={() => {
                            setActiveForm("pincode");
                            setShowAddMenu(false);
                          }}
                          style={{ border: "none", background: "none", width: "100%", borderRadius: "6px" }}
                        >
                          <span className="badge rounded-circle p-1" style={{ background: "#ec4899", width: "8px", height: "8px", display: "inline-block" }}></span>
                          Pincode
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-boundaries listings */}
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {!hasAnySubEntity && (
                    <div className="text-center py-4 text-muted">
                      <i className="material-icons d-block mb-1" style={{ fontSize: "28px" }}>dns</i>
                      <span style={{ fontSize: "12px" }}>No city, area or pincode found</span>
                    </div>
                  )}

                  {hasAnySubEntity && (
                    <ul className="list-group list-group-flush">
                      {citiesList.map(c => {
                        const srvNames = (Array.isArray(c.service_ids) ? c.service_ids : [])
                          .map(sid => availableServices.find(s => s.id === sid)?.name)
                          .filter(Boolean);
                        const subNames = (Array.isArray(c.subscription_ids) ? c.subscription_ids : [])
                          .map(subId => availableSubscriptions.find(s => s.id === subId)?.name)
                          .filter(Boolean);

                        return (
                          <li 
                            key={`city-${c.id}`} 
                            className="list-group-item px-2 py-2 d-flex justify-content-between align-items-center" 
                            style={{ background: "transparent", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s" }}
                            onClick={() => {
                              handleEditCity(c);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            title="Click to view/edit city details & center map"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge rounded-circle" style={{ background: "#4f46e5", width: "8px", height: "8px", display: "inline-block" }}></span>
                              <div>
                                <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>City: {c.name}</div>
                                {srvNames.length > 0 && (
                                  <div className="d-flex flex-wrap gap-1 mt-1">
                                    {srvNames.map((srvName, idx) => (
                                      <span key={idx} className="badge" style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "10px", fontWeight: "600" }}>
                                        {srvName}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {subNames.length > 0 && (
                                  <div className="d-flex flex-wrap gap-1 mt-1 align-items-center">
                                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#047857", marginRight: "2px" }}>Buy Pass:</span>
                                    {subNames.map((subName, idx) => (
                                      <span key={idx} className="badge" style={{ background: "#d1fae5", color: "#047857", fontSize: "10px", fontWeight: "600" }}>
                                        {subName}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <button 
                                className="btn btn-link p-1 text-primary" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleEditCity(c); 
                                }}
                                title="Edit City"
                              >
                                <i className="material-icons" style={{ fontSize: "18px" }}>edit</i>
                              </button>
                              <button className="btn btn-link p-1 text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteCity(c.id); }}>
                                <i className="material-icons" style={{ fontSize: "18px" }}>delete</i>
                              </button>
                            </div>
                          </li>
                        );
                      })}

                      {areasList.map(a => {
                        const isHighlighted = a.id === highlightedAreaId;
                        return (
                          <li 
                            key={`area-${a.id}`} 
                            className="list-group-item px-2 py-2 d-flex justify-content-between align-items-center" 
                            style={{ 
                              background: isHighlighted ? "#e2e8f0" : "transparent", 
                              cursor: "pointer", 
                              borderRadius: "8px", 
                              transition: "all 0.2s",
                              borderLeft: isHighlighted ? "3px solid #ff0075" : "none"
                            }}
                            onClick={() => {
                              try {
                                const path = JSON.parse(a.coordinates);
                                if (path && path.length > 0) {
                                  setMapCenter(path[0]);
                                  setMapZoom(13);
                                  setHighlightedAreaId(a.id);
                                  setActiveForm("");
                                }
                              } catch (err) {
                                console.error("Error centering on area coordinates:", err);
                              }
                            }}
                            onMouseEnter={(e) => { if (!isHighlighted) e.currentTarget.style.background = "#f1f5f9"; }}
                            onMouseLeave={(e) => { if (!isHighlighted) e.currentTarget.style.background = "transparent"; }}
                            title="Click to highlight area on map"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge rounded-circle" style={{ background: "#10b981", width: "8px", height: "8px", display: "inline-block" }}></span>
                              <div>
                                <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>Area</div>
                                <div className="text-muted" style={{ fontSize: "12px" }}>{a.name}</div>
                              </div>
                            </div>
                            <button className="btn btn-link p-1 text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteArea(a.id); }}>
                              <i className="material-icons" style={{ fontSize: "18px" }}>delete</i>
                            </button>
                          </li>
                        );
                      })}

                      {pincodesList.map(p => (
                        <li 
                          key={`pin-${p.id}`} 
                          className="list-group-item px-2 py-2 d-flex justify-content-between align-items-center" 
                          style={{ background: "transparent", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s" }}
                          onClick={() => {
                            geocodeAndCenterCity(`${p.pincode}, ${p.city || ""}`);
                            setActiveForm("");
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          title="Click to center map on pincode"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge rounded-circle" style={{ background: "#ec4899", width: "8px", height: "8px", display: "inline-block" }}></span>
                            <div>
                              <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>Pincode</div>
                              <div className="text-muted" style={{ fontSize: "12px" }}>{p.pincode} ({p.city || "Unknown"})</div>
                            </div>
                          </div>
                          <button className="btn btn-link p-1 text-danger" onClick={(e) => { e.stopPropagation(); handleDeletePincode(p.id); }}>
                            <i className="material-icons" style={{ fontSize: "18px" }}>delete</i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive details / forms */}
          <div className="col-12 col-lg-8">
            <div className="card h-100" style={{ border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow-card)", background: "white" }}>
              <div className="card-body p-4 d-flex flex-column">
                
                {/* Dynamically active form: Add / Edit City */}
                {activeForm === "city" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-4">{editingCityId ? "Edit City" : "Add City"}</h5>
                    <form onSubmit={handleSaveCity}>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Address / Search *</label>
                          <input 
                            ref={cityInputRef} 
                            type="text" 
                            className="form-control p-2" 
                            placeholder="Type a city to search..."
                            value={cityAddress}
                            onChange={(e) => setCityAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Name *</label>
                          <input 
                            type="text" 
                            className="form-control p-2" 
                            value={cityName} 
                            onChange={(e) => setCityName(e.target.value)} 
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>State</label>
                          <input 
                            type="text" 
                            className="form-control p-2" 
                            value={cityState} 
                            onChange={(e) => setCityState(e.target.value)} 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Country</label>
                          <input 
                            type="text" 
                            className="form-control p-2" 
                            value={cityCountry} 
                            onChange={(e) => setCityCountry(e.target.value)} 
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-muted fw-semibold d-block" style={{ fontSize: "12px" }}>Status</label>
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              role="switch" 
                              checked={cityStatus} 
                              onChange={(e) => setCityStatus(e.target.checked)}
                              style={{ width: "36px", height: "18px", cursor: "pointer" }}
                            />
                          </div>
                        </div>

                        {/* Vehicle Services Selection */}
                        <div className="col-12 mt-3">
                          <label className="form-label text-dark fw-semibold d-block mb-2" style={{ fontSize: "13px" }}>
                            Vehicle Services (Multiple)
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {availableServices.map((srv) => {
                              const srvIdNum = Number(srv.id);
                              const isSelected = selectedServiceIds.map(Number).includes(srvIdNum);
                              return (
                                <div
                                  key={srv.id}
                                  onClick={() => {
                                    setSelectedServiceIds((prev) => {
                                      const prevNums = prev.map(Number);
                                      if (prevNums.includes(srvIdNum)) {
                                        return prevNums.filter((id) => id !== srvIdNum);
                                      } else {
                                        return [...prevNums, srvIdNum];
                                      }
                                    });
                                  }}
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    border: isSelected ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                                    background: isSelected ? "#f5f3ff" : "#ffffff",
                                    color: isSelected ? "#4f46e5" : "#334155",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                                  />
                                  <span>{srv.name}</span>
                                  <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                    (₹{parseFloat(srv.base_charge || 0).toFixed(2)})
                                  </span>
                                </div>
                              );
                            })}
                            {availableServices.length === 0 && (
                              <span className="text-muted" style={{ fontSize: "12px" }}>No vehicle services available.</span>
                            )}
                          </div>
                        </div>

                        {/* Subscription Passes Selection */}
                        <div className="col-12 mt-3">
                          <label className="form-label text-dark fw-semibold d-block mb-2" style={{ fontSize: "13px" }}>
                            Subscription Passes (Multiple)
                          </label>
                          <div className="d-flex flex-wrap gap-2">
                            {availableSubscriptions.map((sub) => {
                              const subIdNum = Number(sub.id);
                              const isSelected = selectedSubscriptionIds.map(Number).includes(subIdNum);
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => {
                                    setSelectedSubscriptionIds((prev) => {
                                      const prevNums = prev.map(Number);
                                      if (prevNums.includes(subIdNum)) {
                                        return prevNums.filter((id) => id !== subIdNum);
                                      } else {
                                        return [...prevNums, subIdNum];
                                      }
                                    });
                                  }}
                                  style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    border: isSelected ? "2px solid #10b981" : "1px solid #cbd5e1",
                                    background: isSelected ? "#ecfdf5" : "#ffffff",
                                    color: isSelected ? "#047857" : "#334155",
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    style={{ cursor: "pointer", accentColor: "#10b981" }}
                                  />
                                  <span>{sub.name}</span>
                                  <span style={{ fontSize: "11px", opacity: 0.85 }}>
                                    ({sub.price})
                                  </span>
                                </div>
                              );
                            })}
                            {availableSubscriptions.length === 0 && (
                              <span className="text-muted" style={{ fontSize: "12px" }}>No subscription passes available.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-light" onClick={() => { setActiveForm(""); setEditingCityId(null); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ background: "var(--grad-btn)", border: "none" }}>{editingCityId ? "Update City" : "Add City"}</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Dynamically active form: Add Area */}
                {activeForm === "area" && (
                  <div className="d-flex flex-column flex-grow-1">
                    <h5 className="fw-bold text-dark mb-3">Add Area</h5>
                    <form onSubmit={handleAddArea} className="d-flex flex-column flex-grow-1">
                      <div className="mb-3">
                        <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Area Name *</label>
                        <input 
                          type="text" 
                          className="form-control p-2" 
                          placeholder="e.g. Surat Ring Road Zone"
                          value={areaName}
                          onChange={(e) => setAreaName(e.target.value)}
                          required
                        />
                      </div>

                      {selectedLocation.cities && selectedLocation.cities.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Select Reference City (to center map)</label>
                          <select 
                            className="form-select p-2" 
                            onChange={(e) => geocodeAndCenterCity(e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Select reference city...</option>
                            {selectedLocation.cities.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Map Drawing Canvas */}
                      <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
                        👉 <strong>How to draw:</strong> Click directly on the map to add boundary points. The lines will automatically connect. Click <strong>Reset</strong> to start over, or click <strong>Delete Last Point</strong> to undo the last clicked point.
                      </p>
                      <div className="flex-grow-1 mb-3 position-relative" style={{ minHeight: "350px" }}>
                        {loadError && (
                          <div className="alert alert-danger">Error loading Google Maps.</div>
                        )}
                        {!isLoaded && !loadError && (
                          <div className="d-flex justify-content-center align-items-center h-100 bg-light rounded">
                            <div className="spinner-border text-primary" />
                          </div>
                        )}
                        {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            onClick={handleMapClick}
                          >
                            {drawnCoordinates.length > 0 && (
                              <PolygonF
                                path={drawnCoordinates}
                                options={{
                                  fillColor: "rgba(255, 0, 117, 0.25)",
                                  strokeColor: "#ff0075",
                                  strokeOpacity: 0.9,
                                  strokeWeight: 3,
                                }}
                              />
                            )}
                            {drawnCoordinates.map((coord, index) => (
                              <MarkerF
                                key={`draw-point-${index}`}
                                position={coord}
                                label={{
                                  text: String(index + 1),
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                              />
                            ))}
                          </GoogleMap>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check form-switch mb-0">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            role="switch" 
                            checked={areaStatus} 
                            onChange={(e) => setAreaStatus(e.target.checked)}
                            style={{ width: "36px", height: "18px", cursor: "pointer" }}
                          />
                          <label className="form-check-label text-muted ms-2" style={{ fontSize: "12px" }}>Active Status</label>
                        </div>

                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-light" onClick={() => setActiveForm("")}>Cancel</button>
                          {drawnCoordinates.length > 0 && (
                            <button type="button" className="btn btn-secondary text-white" onClick={() => setDrawnCoordinates(prev => prev.slice(0, -1))}>Delete Last Point</button>
                          )}
                          <button type="button" className="btn btn-warning text-white" onClick={() => setDrawnCoordinates([])}>Reset</button>
                          <button type="submit" className="btn btn-primary" style={{ background: "var(--grad-btn)", border: "none" }}>Add Area</button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Dynamically active form: Add Pincode */}
                {activeForm === "pincode" && (
                  <div>
                    <h5 className="fw-bold text-dark mb-4">Add Pincode</h5>
                    <form onSubmit={handleAddPincode}>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Pincode *</label>
                          <input 
                            ref={pincodeInputRef}
                            type="text" 
                            className="form-control p-2" 
                            placeholder="Type pincode (e.g. 380015)..."
                            value={pincodeSearch}
                            onChange={(e) => setPincodeSearch(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Name</label>
                          <input 
                            type="text" 
                            className="form-control p-2" 
                            placeholder="Name"
                            value={pincodeName} 
                            onChange={(e) => setPincodeName(e.target.value)} 
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-muted fw-semibold d-block" style={{ fontSize: "12px" }}>Status</label>
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              role="switch" 
                              checked={pincodeStatus} 
                              onChange={(e) => setPincodeStatus(e.target.checked)}
                              style={{ width: "36px", height: "18px", cursor: "pointer" }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-light" onClick={() => setActiveForm("")}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ background: "var(--grad-btn)", border: "none" }}>Add Pincode</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Default Map Dashboard showing all registered boundaries */}
                {activeForm === "" && (
                  <div className="d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold text-dark mb-0">Location Overview Map</h5>
                      <span className="badge bg-light text-muted border py-2 px-3" style={{ fontSize: "11px" }}>
                        Cities: {citiesList.length} | Areas: {areasList.length} | Pincodes: {pincodesList.length}
                      </span>
                    </div>

                    <div className="flex-grow-1 position-relative" style={{ minHeight: "420px" }}>
                      {loadError && (
                        <div className="alert alert-danger">Error loading Google Maps.</div>
                      )}
                      {!isLoaded && !loadError && (
                        <div className="d-flex justify-content-center align-items-center h-100 bg-light rounded">
                          <div className="spinner-border text-primary" />
                        </div>
                      )}
                      {isLoaded && (
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={10}
                        >
                          {/* Render all area polygons */}
                          {areasList.map((area) => {
                            try {
                              const path = JSON.parse(area.coordinates);
                              return (
                                <PolygonF
                                  key={`poly-${area.id}`}
                                  path={path}
                                  options={{
                                    fillColor: area.id === highlightedAreaId 
                                      ? "rgba(255, 0, 117, 0.35)" 
                                      : (area.is_active === 1 ? "rgba(16, 185, 129, 0.15)" : "rgba(156, 163, 175, 0.1)"),
                                    strokeColor: area.id === highlightedAreaId 
                                      ? "#ff0075" 
                                      : (area.is_active === 1 ? "#10b981" : "#9ca3af"),
                                    strokeOpacity: 0.9,
                                    strokeWeight: area.id === highlightedAreaId ? 4 : 2,
                                  }}
                                />
                              );
                            } catch (e) {
                              console.error("Invalid polygon coordinates stored inside Area:", area);
                              return null;
                            }
                          })}
                          
                          {/* We can place markers for cities */}
                          {/* Note: Cities don't store lat/lng in table, but we geocode or use center of map */}
                        </GoogleMap>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container-fluid py-4" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      {viewMode === "list" ? renderListView() : renderEditView()}

      {/* Add main Location Modal */}
      <Modal 
        isOpen={showAddLocationModal} 
        onClose={() => setShowAddLocationModal(false)} 
        title="Add Location"
      >
        <form onSubmit={handleCreateLocation}>
          <div className="mb-4">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "12px" }}>Location Name *</label>
            <input 
              type="text" 
              className="form-control p-2" 
              placeholder="e.g. Surat, Ahmedabad"
              value={locationName} 
              onChange={e => setLocationName(e.target.value)} 
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button type="button" className="btn btn-light" onClick={() => setShowAddLocationModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: "var(--grad-btn)", border: "none" }}>Save</button>
          </div>
        </form>
      </Modal>

      {/* View Location Details Modal */}
      <Modal 
        isOpen={viewLocationModal.isOpen} 
        onClose={() => setViewLocationModal({ isOpen: false, location: null })} 
        title={`Location Details: ${viewLocationModal.location?.name || ''}`}
      >
        {viewLocationModal.location && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <span className="text-muted small">Status: </span>
                <span className={`badge ${viewLocationModal.location.is_active === 1 ? 'bg-success' : 'bg-secondary'}`}>
                  {viewLocationModal.location.is_active === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => {
                  const locId = viewLocationModal.location.id;
                  setViewLocationModal({ isOpen: false, location: null });
                  loadLocationForEdit(locId);
                }}
                style={{ background: "var(--grad-btn)", border: "none" }}
              >
                <i className="material-icons me-1" style={{ fontSize: "14px", verticalAlign: "middle" }}>edit</i> Edit Location
              </button>
            </div>

            {/* Cities Section */}
            {(!viewLocationModal.location.cities || viewLocationModal.location.cities.length === 0) ? (
              <div className="text-center py-4 text-muted">
                <i className="material-icons d-block mb-1" style={{ fontSize: "32px" }}>location_off</i>
                No cities added in this location.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {viewLocationModal.location.cities.map((c) => {
                  const srvNames = (Array.isArray(c.service_ids) ? c.service_ids : [])
                    .map(sid => availableServices.find(s => s.id === sid)?.name)
                    .filter(Boolean);
                  const subNames = (Array.isArray(c.subscription_ids) ? c.subscription_ids : [])
                    .map(subId => availableSubscriptions.find(s => s.id === subId)?.name)
                    .filter(Boolean);

                  return (
                    <div 
                      key={c.id} 
                      style={{ 
                        background: "#f8fafc", 
                        border: "1px solid #e2e8f0", 
                        borderRadius: "12px", 
                        padding: "16px" 
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4f46e5", display: "inline-block" }}></span>
                          <h6 className="fw-bold mb-0" style={{ color: "#1e293b", fontSize: "15px" }}>
                            City: {c.name}
                          </h6>
                        </div>
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-link p-0 text-primary" 
                            onClick={() => {
                              const locId = viewLocationModal.location.id;
                              setViewLocationModal({ isOpen: false, location: null });
                              loadLocationForEdit(locId);
                              setTimeout(() => handleEditCity(c), 300);
                            }}
                            title="Edit City"
                          >
                            <i className="material-icons" style={{ fontSize: "18px" }}>edit</i>
                          </button>
                          <button 
                            className="btn btn-sm btn-link p-0 text-danger" 
                            onClick={() => {
                              handleDeleteCity(c.id);
                              setViewLocationModal({ isOpen: false, location: null });
                            }}
                            title="Delete City"
                          >
                            <i className="material-icons" style={{ fontSize: "18px" }}>delete</i>
                          </button>
                        </div>
                      </div>

                      {/* Vehicle Services */}
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          {srvNames.length > 0 ? (
                            srvNames.map((srv, i) => (
                              <span key={i} className="badge" style={{ background: "#e0e7ff", color: "#4338ca", fontSize: "11px", fontWeight: "600", padding: "5px 10px", borderRadius: "6px" }}>
                                {srv}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>No Vehicle Services</span>
                          )}
                        </div>
                      </div>

                      {/* Buy Pass Section */}
                      <div className="mt-3 pt-2 border-top">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="material-icons" style={{ fontSize: "15px", color: "#047857" }}>confirmation_number</i>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#047857", textTransform: "uppercase" }}>Buy Pass:</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          {subNames.length > 0 ? (
                            subNames.map((sub, i) => (
                              <span key={i} className="badge" style={{ background: "#d1fae5", color: "#047857", fontSize: "11px", fontWeight: "600", padding: "5px 10px", borderRadius: "6px" }}>
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>No Driver Passes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Geofences;

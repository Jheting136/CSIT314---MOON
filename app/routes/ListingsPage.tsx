    import { useState, useEffect } from 'react';
    import { listingController } from '../controllers/listingController';

    // MUI imports
    import {
      Box,
      Container,
      Typography,
      TextField,
      Slider,
      MenuItem,
      Select,
      InputLabel,
      FormControl,
      Grid,
      Card,
      CardContent,
      CardMedia,
      Button
    } from '@mui/material';

    const availableServices = [
      "General Cleaning",
      "Kitchen Cleaning",
      "Bathroom Cleaning",
      "Deep Cleaning",
      "Window Cleaning",
      "Carpet Cleaning",
      "Office Cleaning",
      "Commercial Cleaning",
      "Floor Maintenance"
    ];

    export default function ListingsPage() {
      const [listings, setListings] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [minPrice, setMinPrice] = useState<number | ''>('');
      const [maxPrice, setMaxPrice] = useState<number | ''>('');
      const [minRating, setMinRating] = useState(0);
      const [selectedService, setSelectedService] = useState('');
      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(0);
      const itemsPerPage = 9;

      const getListings = async () => {
        const filters = [];

        if (searchTerm) {
          filters.push(
            { column: 'name', operator: 'ilike', value: `%${searchTerm}%` }
          );
        }

        if (minPrice !== '') filters.push({ column: 'rates', operator: 'gte', value: minPrice });
        if (maxPrice !== '') filters.push({ column: 'rates', operator: 'lte', value: maxPrice });
        if (minRating > 0) filters.push({ column: 'average_rating', operator: 'gte', value: minRating });
        if (selectedService !== '') filters.push({ column: 'services_offered', operator: 'cs', value: [selectedService] });

        const result = await listingController.getListings(filters);

        console.log('Fetched listings:', result.data);

        setListings(result.data || []);

        setTotalPages(Math.ceil(result.count / itemsPerPage));
      };

      useEffect(() => {
        getListings();
      }, [searchTerm, minPrice, maxPrice, minRating, selectedService, currentPage]);

      return (
        <Box sx={{ background: 'linear-gradient(to bottom, #111827, #000)', minHeight: '100vh', py: 8, color: '#fff' }}>
          <Container>
            <Box textAlign="center" mb={6}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Find Your Perfect Cleaner
              </Typography>
              <Typography variant="body1" color="gray">
                Browse trusted cleaners. Filter by price, ratings, and more.
              </Typography>
            </Box>

            <Box bgcolor="#1f2937" borderRadius={3} p={4} mb={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Price"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value === '' ? '' : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Price"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value === '' ? '' : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography gutterBottom color="gray">Minimum Rating: {minRating.toFixed(1)}</Typography>
                  <Slider
                    value={minRating}
                    onChange={(e, val) => {
                      setMinRating(val as number);
                      setCurrentPage(1);
                    }}
                    min={0}
                    max={5}
                    step={0.1}
                    sx={{ color: '#3b82f6' }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#ccc' }}>Service</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => {
                        setSelectedService(e.target.value);
                        setCurrentPage(1);
                      }}
                      label="Service"
                      sx={{ color: '#fff' }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {availableServices.map(service => (
                        <MenuItem key={service} value={service}>{service}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" color="gray" mb={2}>
              Showing {listings.length} cleaners (Page {currentPage} of {totalPages})
            </Typography>

            <Grid container spacing={4}>
              {listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <Card sx={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    <CardMedia
                      component="div"
                      sx={{ height: 150, backgroundColor: '#374151', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Box
                        sx={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Typography variant="h4" color="gray">👤</Typography>
                      </Box>
                    </CardMedia>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Box>
                          <Typography variant="h6">{listing.name}</Typography>
                          <Typography variant="body2" color="gray">{listing.location}</Typography>
                        </Box>
                        <Typography variant="body1" bgcolor="#3b82f6" px={2} py={0.5} borderRadius={1}>
                          ${listing.rates}/hr
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Typography color="yellow">{'★'.repeat(Math.floor(listing.average_rating))}</Typography>
                        <Typography color="gray" ml={1}>({listing.average_rating.toFixed(1)})</Typography>
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {availableServices.map(service => (
                          <Box key={service} px={1} py={0.5} bgcolor="#374151" borderRadius={1}>
                            <Typography variant="caption" color="gray">{service}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={6} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                sx={{ backgroundColor: '#3b82f6' }}
              >
                Previous
              </Button>
              <Typography>{currentPage}</Typography>
              <Button
                variant="contained"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                sx={{ backgroundColor: '#3b82f6' }}
              >
                Next
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }
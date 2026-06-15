// @ts-nocheck
import { Box, Container, Typography, Button, Grid, Card, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import CalculateIcon from '@mui/icons-material/Calculate'
import BrushIcon from '@mui/icons-material/Brush'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CheckIcon from '@mui/icons-material/Check'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const features = [
  {
    icon: <GridViewIcon />,
    title: 'AI Floor Plans',
    description: 'Generate intelligent 2D floor plans instantly with our AI. Customize every room, wall, and space.',
    color: '#6C63FF',
  },
  {
    icon: <ViewInArIcon />,
    title: '3D Visualization',
    description: 'Step inside your design with immersive 3D rendering. Rotate, explore, and experience your space.',
    color: '#FF6584',
  },
  {
    icon: <AutoAwesomeIcon />,
    title: 'AI Designer',
    description: 'Chat with an AI architect that understands your vision and transforms it into reality.',
    color: '#4FC3F7',
  },
  {
    icon: <CalculateIcon />,
    title: 'Cost Estimation',
    description: 'Get detailed material and labor cost breakdowns before construction begins.',
    color: '#66BB6A',
  },
  {
    icon: <BrushIcon />,
    title: 'Interior Studio',
    description: 'Design every room with AI-powered interior suggestions, furniture, and materials.',
    color: '#FFB74D',
  },
  {
    icon: <StorefrontIcon />,
    title: 'Architect Marketplace',
    description: 'Connect with verified professional architects to bring your vision to life.',
    color: '#CE93D8',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Perfect for exploring',
    features: ['3 Projects', '5 AI Generations', 'Basic Floor Plan', '3D Preview', 'Community Support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    description: 'For serious designers',
    features: ['Unlimited Projects', '100 AI Generations', 'Advanced Floor Plan', 'Full 3D Viewer', 'Cost Estimator', 'Interior Studio', 'Priority Support'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: '/month',
    description: 'For teams & firms',
    features: ['Everything in Pro', 'Unlimited AI Generations', 'Team Collaboration', 'Architect Marketplace', 'API Access', 'Custom Branding', 'Dedicated Support'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0C10 0%, #0D0F18 50%, #0A0C10 100%)',
        color: 'white',
        overflowX: 'hidden',
      }}
    >
      {/* Navbar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          background: 'rgba(10,12,16,0.8)',
          borderBottom: '1px solid rgba(108,99,255,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HomeWorkIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                HouseOS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: 'rgba(255,255,255,0.8)' }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                  '&:hover': { background: 'linear-gradient(135deg, #5750D9, #7A73EE)' },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: 18, pb: 12 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
        >
          <Chip
            label="AI-Powered Architecture"
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              mb: 3,
              background: 'rgba(108,99,255,0.15)',
              color: '#8B85FF',
              border: '1px solid rgba(108,99,255,0.3)',
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #C8C4FF 50%, #FF6584 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Design Your Dream Home with AI
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 400,
              lineHeight: 1.7,
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            From AI-generated floor plans to 3D visualization and cost estimation — build your perfect home with the power of artificial intelligence.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register')}
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5750D9, #7A73EE)',
                  boxShadow: '0 12px 40px rgba(108,99,255,0.5)',
                },
              }}
            >
              Start Building Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderColor: 'rgba(108,99,255,0.4)',
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  borderColor: '#6C63FF',
                  background: 'rgba(108,99,255,0.08)',
                },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        {/* Hero Visual */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          sx={{ mt: 10, position: 'relative' }}
        >
          <Box
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(108,99,255,0.2)',
              background: 'linear-gradient(135deg, rgba(17,19,24,0.9), rgba(20,22,32,0.9))',
              backdropFilter: 'blur(20px)',
              p: 4,
              boxShadow: '0 40px 120px rgba(108,99,255,0.2)',
            }}
          >
            <Grid container spacing={3}>
              {[
                { label: 'AI Floor Plans', value: '2,400+', color: '#6C63FF' },
                { label: 'Active Projects', value: '18,900+', color: '#FF6584' },
                { label: 'Architects', value: '340+', color: '#4FC3F7' },
                { label: 'Happy Users', value: '12,000+', color: '#66BB6A' },
              ].map((stat) => (
                <Grid item xs={6} md={3} key={stat.label}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, color: stat.color, letterSpacing: '-0.02em' }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* Features */}
      <Box sx={{ py: 12, background: 'rgba(108,99,255,0.03)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Everything you need to{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                build smarter
              </Box>
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              Professional architecture tools powered by artificial intelligence
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: 'rgba(17,19,24,0.8)',
                    border: '1px solid rgba(108,99,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    '&:hover': {
                      border: `1px solid ${feature.color}33`,
                      boxShadow: `0 8px 32px ${feature.color}22`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      background: `${feature.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      mb: 2,
                      '& .MuiSvgIcon-root': { fontSize: 24 },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Simple, transparent pricing
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            Choose the plan that fits your needs
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {pricingPlans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.name}>
              <Card
                component={motion.div}
                whileHover={{ y: -4 }}
                sx={{
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.08))'
                    : 'rgba(17,19,24,0.8)',
                  border: plan.highlight
                    ? '1px solid rgba(108,99,255,0.4)'
                    : '1px solid rgba(108,99,255,0.1)',
                  overflow: 'visible',
                }}
              >
                {plan.highlight && (
                  <Chip
                    label="Most Popular"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                  {plan.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'white' }}>
                    ${plan.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {plan.period}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, mb: 3 }}>
                  {plan.features.map((feat) => (
                    <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckIcon sx={{ fontSize: 16, color: '#6C63FF' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {feat}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant={plan.highlight ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.2,
                    ...(plan.highlight
                      ? {
                          background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                          '&:hover': { background: 'linear-gradient(135deg, #5750D9, #7A73EE)' },
                        }
                      : {
                          borderColor: 'rgba(108,99,255,0.4)',
                          color: 'rgba(255,255,255,0.8)',
                          '&:hover': { borderColor: '#6C63FF', background: 'rgba(108,99,255,0.08)' },
                        }),
                  }}
                >
                  {plan.cta}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.08))',
              border: '1px solid rgba(108,99,255,0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
            >
              Ready to build your dream home?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, mb: 4 }}>
              Join 12,000+ homebuilders using HouseOS to design smarter.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
              }}
            >
              Start for Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: '1px solid rgba(108,99,255,0.12)', background: 'rgba(8,10,14,0.8)', pt: 8, pb: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Brand */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeWorkIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  HouseOS
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 220 }}>
                AI-powered architecture tools for homeowners, builders, and architects worldwide.
              </Typography>
            </Grid>

            {/* Product */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Product
              </Typography>
              {[
                { label: 'AI Floor Plans', path: '/register' },
                { label: '3D Viewer', path: '/register' },
                { label: 'Cost Estimator', path: '/register' },
                { label: 'Interior Studio', path: '/register' },
                { label: 'Marketplace', path: '/register' },
                { label: 'Smart Home', path: '/register' },
              ].map((l) => (
                <Typography key={l.label} variant="body2" onClick={() => navigate(l.path)}
                  sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', mb: 0.8, fontSize: '0.85rem', '&:hover': { color: '#8B85FF' } }}>
                  {l.label}
                </Typography>
              ))}
            </Grid>

            {/* Company */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Company
              </Typography>
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Our Team', path: '/about#team' },
                { label: 'Careers', path: '#' },
                { label: 'Press Kit', path: '#' },
                { label: 'Partners', path: '#' },
                { label: 'Contact', path: '#' },
              ].map((l) => (
                <Typography key={l.label} variant="body2" onClick={() => navigate(l.path)}
                  sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', mb: 0.8, fontSize: '0.85rem', '&:hover': { color: '#8B85FF' } }}>
                  {l.label}
                </Typography>
              ))}
            </Grid>

            {/* Resources */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Resources
              </Typography>
              {[
                { label: 'Documentation', path: '#' },
                { label: 'Blog', path: '#' },
                { label: 'Tutorials', path: '#' },
                { label: 'Community', path: '/register' },
                { label: 'Changelog', path: '#' },
                { label: 'API Docs', path: '#' },
              ].map((l) => (
                <Typography key={l.label} variant="body2" onClick={() => navigate(l.path)}
                  sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', mb: 0.8, fontSize: '0.85rem', '&:hover': { color: '#8B85FF' } }}>
                  {l.label}
                </Typography>
              ))}
            </Grid>

            {/* Legal */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Legal
              </Typography>
              {[
                { label: 'Privacy Policy', path: '#' },
                { label: 'Terms of Service', path: '#' },
                { label: 'Cookie Policy', path: '#' },
                { label: 'GDPR', path: '#' },
                { label: 'Security', path: '#' },
              ].map((l) => (
                <Typography key={l.label} variant="body2" onClick={() => navigate(l.path)}
                  sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', mb: 0.8, fontSize: '0.85rem', '&:hover': { color: '#8B85FF' } }}>
                  {l.label}
                </Typography>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ borderTop: '1px solid rgba(108,99,255,0.08)', pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>
              © 2026 HouseOS · All rights reserved · Built with ♥ by KKABIR07
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'About', path: '/about' },
                { label: 'Support', path: '#' },
                { label: 'Status', path: '#' },
              ].map((link) => (
                <Typography
                  key={link.label}
                  variant="body2"
                  onClick={() => navigate(link.path)}
                  sx={{ color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.82rem', '&:hover': { color: '#6C63FF' } }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

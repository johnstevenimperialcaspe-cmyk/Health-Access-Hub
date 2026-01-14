import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import mentalhealth1 from "../assets/mentalhealth1.png";
import mentalhealth2 from "../assets/mentalhealth2.png";
import healthexercise1 from "../assets/healthexercise1.png";
import healthexercise2 from "../assets/healthexercise2.png";
import body1 from "../assets/body1.png";
import body2 from "../assets/body2.png";
import dyk1 from "../assets/dyk1.png";
import dyk2 from "../assets/dyk2.png";

const slides = [
  {
    title: "Mental Health",
    link: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
    img1: mentalhealth1,
    img2: mentalhealth2,
  },
  {
    title: "Health Exercise",
    link: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389",
    img1: healthexercise1,
    img2: healthexercise2,
  },
  {
    title: "Take Care of Your Body",
    link: "https://www.cdc.gov/howrightnow/taking-care/index.html",
    img1: body1,
    img2: body2,
  },
  {
    title: "Facts About Human Body",
    link: "https://www.natgeokids.com/uk/discover/science/general-science/15-facts-about-the-human-body/",
    img1: dyk1,
    img2: dyk2,
  },
];

const HealthSlideshow = ({ sx = {}, autoPlayInterval = 5000 }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      next();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [index, isPaused, autoPlayInterval]);

  const slide = slides[index];

  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Box
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 3,
          border: "2px solid #0F172A",
          background: "linear-gradient(90deg, #ffffffff, #ffffff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          minHeight: 280,
          gap: 3,
        }}
      >
        {/* Left Arrow */}
        <IconButton
          onClick={prev}
          sx={{
            position: "absolute",
            left: 12,
            zIndex: 10,
            bgcolor: "background.paper",
            boxShadow: 2,
            border: "2px solid #0F172A",
            "&:hover": { bgcolor: "#f3f6fb" },
          }}
          aria-label="previous"
        >
          <ArrowBackIos />
        </IconButton>

        {/* Images Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flex: 1,
            mx: 4,
          }}
        >
          <img
            src={slide.img1}
            alt={`${slide.title} 1`}
            style={{
              height: 220,
              width: "auto",
              objectFit: "contain",
              maxWidth: "40%",
            }}
          />
          <img
            src={slide.img2}
            alt={`${slide.title} 2`}
            style={{
              height: 220,
              width: "auto",
              objectFit: "contain",
              maxWidth: "40%",
            }}
          />
        </Box>

        {/* Right Arrow */}
        <IconButton
          onClick={next}
          sx={{
            position: "absolute",
            right: 12,
            zIndex: 10,
            bgcolor: "background.paper",
            boxShadow: 2,
            border: "2px solid #0F172A",
            "&:hover": { bgcolor: "#f3f6fb" },
          }}
          aria-label="next"
        >
          <ArrowForwardIos />
        </IconButton>

        {/* Text Content (Bottom Left) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: 16,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0F172A" }}>
            {slide.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click here!
          </Typography>
          <Button
            href={slide.link}
            target="_blank"
            rel="noreferrer"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.7rem",
              p: 0,
              justifyContent: "flex-start",
              textDecoration: "underline",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            {slide.link}
          </Button>
        </Box>

        {/* Dots (Bottom Right) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            gap: 1,
          }}
        >
          {slides.map((s, i) => (
            <Box
              key={s.title}
              onClick={() => setIndex(i)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: i === index ? "primary.main" : "rgba(0,0,0,0.12)",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HealthSlideshow;

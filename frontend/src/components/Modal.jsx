import React from "react";
import {
  Modal as MuiModal,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Modal = ({ isOpen, onClose, title, children }) => {

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      closeAfterTransition
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500, md: 600 },
          maxWidth: 800,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          overflow: "auto",
          outline: "none",
        }}
      >
        {/* Header with Title and Close Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            fontWeight="bold"
          >
            {title}
          </Typography>
          <IconButton
            aria-label="close modal"
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Modal Body */}
        <Box id="modal-description">{children}</Box>
      </Box>
    </MuiModal>
  );
};

export default Modal;

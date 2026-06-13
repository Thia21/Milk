import { Grid, Paper, Stack, Typography } from "@mui/material";

export default function DashboardCards({ cards }) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Grid item xs={12} sm={6} lg={card.lg || 2.4} key={card.title}>
            <Paper className="dashboard-card">
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <div>
                  <Typography className="card-title">{card.title}</Typography>
                  <Typography className="card-value">{card.value}</Typography>
                  {card.caption && <Typography className="card-caption">{card.caption}</Typography>}
                </div>
                <div className="card-icon" style={{ "--accent": card.color }}>
                  <Icon size={24} />
                </div>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

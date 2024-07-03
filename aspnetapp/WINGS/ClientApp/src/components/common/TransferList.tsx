import React, { useEffect } from 'react';
import { Theme, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { grey } from '@mui/material/colors';

const not = (a: string[], b: string[]) => {
  return a.filter((value) => b.indexOf(value) === -1);
}

const intersection = (a: string[], b: string[]) => {
  return a.filter((value) => b.indexOf(value) !== -1);
}

const union = (a: string[], b: string[]) => {
  return [...a, ...not(b, a)];
}

const GridButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5, 0),
  color: grey[500],
  borderColor: grey[600]
}));

export interface TransferListProps {
  data: string[],
  setSelected: (selected: string[]) => void
}

const TransferList = (props: TransferListProps) => {
  const { data, setSelected } = props;
  const [checked, setChecked] = React.useState<string[]>([]);
  const [left, setLeft] = React.useState<string[]>([]);
  const [right, setRight] = React.useState<string[]>([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);
  const theme: Theme = useTheme();

  const rootStyle = {
    justifyContent: "left",
    "& .MuiListItem-root": {
      height: 30
    }
  };
  const cardHeaderStyle = {
    padding: theme.spacing(1, 2),
  };
  const listStyle = {
    width: 200,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  };

  useEffect(() => {
    setLeft(data);
  }, [data])

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: string[]) => intersection(checked, items).length;

  const handleToggleAll = (items: string[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    const selected = right.concat(leftChecked);
    setSelected(selected);
    setRight(selected);
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const selected = not(right, rightChecked);
    setSelected(selected);
    setLeft(left.concat(rightChecked));
    setRight(selected);
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, items: string[]) => (
    <Card>
      <CardHeader
        sx={cardHeaderStyle}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List sx={listStyle} dense component="div" role="list">
        {items.map((value: string) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} alignItems="center" sx={rootStyle}>
      <Grid item>{customList('Not Selected', left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <GridButton
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </GridButton>
          <GridButton
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </GridButton>
        </Grid>
      </Grid>
      <Grid item>{customList('Selected', right)}</Grid>
    </Grid>
  );
}

export default TransferList;

import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { FileIndex } from '../../models';

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      color: theme.palette.text.secondary,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    selected: {},
    label: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

interface StyledTreeItemProps extends TreeItemProps {
  labelIcon: React.ElementType<SvgIconProps>;
  labelText: string;
}

const StyledTreeItem = (props: StyledTreeItemProps) => {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, color, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} fontSize="small" />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
        </div>
      }
      classes={{
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export interface FileTreeViewProps {
  files: FileIndex[],
  rootPath: string,
  select: any,
  defaultExpandedFolder?: string[]
}

const FileTreeView = (props: FileTreeViewProps) => {
  const classes = useStyles();
  const { files, rootPath, select, defaultExpandedFolder } = props
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    if (nodeIds.includes("folder--")) {
      setSelected([]);
    } else {
      setSelected(nodeIds);
      select(nodeIds);
    }
  };

  var tree: any = {};
  files.forEach((file: FileIndex) => {
    var currentNode = tree;
    const filePath = file.filePath.replace(rootPath, "");
    filePath.split('/').forEach((segment: string) => {
      if (currentNode[segment] === undefined) {
        if (segment.includes(".ops")) {
          currentNode[file.name] = file
        } else {
          currentNode[segment] = {};
        }
      }
      currentNode = currentNode[segment];
    })
  });

  const toTreeData = (tree: any) => {
    return Object.keys(tree).map((label: any) => {
      var o: any = { label: label };
      if ('id' in tree[label]) {
        o.file = tree[label];
      } else if (Object.keys(tree[label]).length > 0) {
        o.children = toTreeData(tree[label]);
      }
      return o;
    })
  };

  const showTreeItem = (data: any) => {
    if (data) {
      return (
        data.length > 0 && data.map((child: any) => {
          const label = child.label;
          if ('file' in child) {
            return <StyledTreeItem key={label} nodeId={child.file.id} labelText={label} labelIcon={DescriptionIcon} />
          } else {
            return (
              <StyledTreeItem key={label} nodeId={`folder--${label}`} labelText={label} labelIcon={FolderIcon}>
                {showTreeItem(child.children)}
              </StyledTreeItem>
            )
          }
        })
      )
    }
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultExpanded={defaultExpandedFolder && defaultExpandedFolder.map(name => "folder--" + name)}
      defaultEndIcon={<div style={{ width: 24 }} />}
      selected={selected}
      onNodeSelect={handleSelect}
    >
      {showTreeItem(toTreeData(tree))}
    </TreeView>
  )
};

export default FileTreeView;

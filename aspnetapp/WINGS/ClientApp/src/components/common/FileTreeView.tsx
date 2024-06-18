import React, { useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { FileIndex } from '../../models';

interface StyledTreeItemProps extends TreeItemProps {
  labelIcon: React.ElementType<SvgIconProps>;
  labelText: string;
}

const StyledTreeItem = (props: StyledTreeItemProps) => {
  const { labelText, labelIcon: LabelIcon, color, ...other } = props;
  const theme: Theme = useTheme();

  const contentStyle = {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular,
    },
  };
  const expandedStyle = {};
  const selectedStyle = {};
  const groupStyle = {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2),
    }
  };
  const labelStyle = {
    fontWeight: 'inherit',
    color: 'inherit',
  };
  const labelRootStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  };
  const labelIconStyle = {
    marginRight: theme.spacing(1),
  };
  const labelTextStyle = {
    fontWeight: 'inherit',
    flexGrow: 1,
  };

  return (
    <TreeItem
      label={
        <div style={labelRootStyle}>
          <LabelIcon color="inherit" sx={labelIconStyle} fontSize="small" />
          <Typography variant="body2" sx={labelTextStyle}>
            {labelText}
          </Typography>
        </div>
      }
      classes={{
        content: contentStyle,
        expanded: expandedStyle,
        selected: selectedStyle,
        group: groupStyle,
        label: labelStyle,
      }}
      {...other}
    />
  );
}

export interface FileTreeViewProps {
  files: FileIndex[],
  rootPath: string,
  select: any,
  defaultExpandedFolder?: string[]
}

const FileTreeView = (props: FileTreeViewProps) => {
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
      sx={{ height: 240, flexGrow: 1, maxWidth: 400 }}
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

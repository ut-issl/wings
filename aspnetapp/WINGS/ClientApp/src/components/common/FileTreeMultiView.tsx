import React, { useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
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
      {...other}
    />
  );
}

export interface FileTreeMultiViewProps {
  files: FileIndex[],
  rootPath: string,
  select: any,
  defaultExpandedFolder?: string[]
}

const FileTreeMultiView = (props: FileTreeMultiViewProps) => {
  const { files, rootPath, select, defaultExpandedFolder } = props

  interface CheckedState {
    [id: string]: boolean;
  }

  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: string[]) => {
    setSelectedItems(ids);
    var fileNameLists: string[] = [];
    files.forEach(element => {
      if (ids.includes(element.id)) {
        fileNameLists.push(element.name);
      }
    })
    select(fileNameLists);
  };

  var convertedRootPath = rootPath.replaceAll("\\", "/");

  var tree: any = {};
  files.forEach((file: FileIndex) => {
    var currentNode = tree;
    var convertedFilePath = file.filePath.replaceAll("\\", "/");
    const filePath = convertedFilePath.replace(convertedRootPath, "");
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
            if (selectedItems.includes(child.file.id)) {
              return <StyledTreeItem key={label} itemId={child.file.id} labelText={label} labelIcon={DescriptionIcon} />
            }
            else {
              return <StyledTreeItem key={label} itemId={child.file.id} labelText={label} labelIcon={DescriptionTwoToneIcon} />
            }
          } else {
            return (
              <StyledTreeItem key={label} itemId={`folder--${label}`} labelText={label} labelIcon={FolderIcon}>
                {showTreeItem(child.children)}
              </StyledTreeItem>
            )
          }
        })
      )
    }
  };

  return (
    <SimpleTreeView
      multiSelect
      selectedItems={selectedItems}
      onSelectedItemsChange={handleSelectedItemsChange}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400 }}
    >
      {showTreeItem(toTreeData(tree))}
    </SimpleTreeView>
  )
};

export default FileTreeMultiView;

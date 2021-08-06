import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import { Container, Button, Icon, Title } from './styles';

const icons = {
  positive: 'arrow-up-circle',
  negative: 'arrow-down-circle',
};

interface Props extends RectButtonProps {
  type: 'positive' | 'negative';
  title: string;
  isActive: boolean;
}

export function TransactionTypeButton({
  type,
  title,
  isActive,
  ...rest
}: Props) {
  return (
    <Container isActive={isActive} type={type}>
      <Button {...rest}>
        <Icon name={icons[type]} type={type} />
        <Title>{title}</Title>
      </Button>
    </Container>
  );
}

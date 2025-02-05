import styled from "@emotion/styled";
import { color } from "metabase/lib/colors";
import MetabotLogo from "metabase/components/MetabotLogo";

export const GreetingRoot = styled.div`
  display: flex;
  align-items: center;
`;

export const GreetingLogo = styled(MetabotLogo)`
  height: 2rem;
`;

export interface GreetingMessageProps {
  showLogo?: boolean;
}

export const GreetingMessage = styled.span<GreetingMessageProps>`
  color: ${color("text-dark")};
  font-size: ${props => (props.showLogo ? "1.125rem" : "1.25rem")};
  font-weight: bold;
  line-height: 1.5rem;
  margin-left: ${props => props.showLogo && "0.5rem"};
`;

import { render, screen } from '@testing-library/react';
import {
  Avatar,
  AvatarFallback,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
  Spinner,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';

describe('additional UI component coverage', () => {
  it('renders textarea with custom classes', () => {
    render(<Textarea className="notes-area" placeholder="Write something" />);

    expect(screen.getByPlaceholderText('Write something')).toHaveClass('notes-area');
  });

  it('renders avatar primitives', () => {
    render(
      <Avatar className="profile-avatar" data-testid="avatar-root">
        <AvatarFallback>LB</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId('avatar-root')).toHaveClass('profile-avatar');
    expect(screen.getByText('LB')).toBeInTheDocument();
    expect(screen.getByText('LB')).toHaveClass('bg-muted');
  });

  it('renders card subcomponents', () => {
    render(
      <div>
        <CardHeader className="custom-header">
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Card content</CardContent>
        <CardFooter>Card footer</CardFooter>
      </div>
    );

    expect(screen.getByText('Card title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toHaveClass('text-sm');
    expect(screen.getByText('Card content')).toHaveClass('p-6');
    expect(screen.getByText('Card footer')).toHaveClass('items-center');
  });

  it('renders dialog text helpers', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">Dialog actions</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-header')).toHaveClass('text-center');
    expect(screen.getByTestId('dialog-footer')).toHaveClass('flex-col-reverse');
    expect(screen.getByText('Dialog title')).toHaveClass('text-lg');
    expect(screen.getByText('Dialog description')).toHaveClass('text-sm');
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders tooltip content with a custom side offset', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button type="button">Hover trigger</button>
          </TooltipTrigger>
          <TooltipContent sideOffset={10}>Tooltip body</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.getAllByText('Tooltip body').length).toBeGreaterThan(0);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('renders spinner and both separator orientations', () => {
    const { container } = render(
      <div>
        <Spinner size="lg" className="loading-spinner" />
        <Separator data-testid="horizontal-separator" />
        <Separator data-testid="vertical-separator" orientation="vertical" />
      </div>
    );

    expect(container.querySelector('.loading-spinner')).toHaveClass('h-8');
    expect(screen.getByTestId('horizontal-separator')).toHaveClass('w-full');
    expect(screen.getByTestId('vertical-separator')).toHaveClass('w-[1px]');
  });
});

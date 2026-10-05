//
//  MorphletContainerView.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletContainerView.h"
#import "MorphletLayoutAnimator.h"
#import "MorphletSpring.h"

#import <react/renderer/components/MorphletSpec/MorphletContainerViewComponentDescriptor.h>
#import <react/renderer/components/MorphletSpec/Props.h>
#import <react/renderer/components/MorphletSpec/RCTComponentViewHelpers.h>

#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;

@implementation MorphletContainerView {
  BOOL _didCapture;
  CGSize _reportedSize;
  MorphletLayoutAnimator *_layoutAnimator;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<MorphletContainerViewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MorphletContainerViewProps>();
    _props = defaultProps;

    _layoutAnimator = [[MorphletLayoutAnimator alloc] initWithRootView:self];
  }
  return self;
}

#pragma mark - RCTMountingTransactionObserving

- (void)mountingTransactionWillMount:(const MountingTransaction &)transaction
                withSurfaceTelemetry:(const SurfaceTelemetry &)surfaceTelemetry {
  _didCapture = self.window != nil && [self.delegate containerViewShouldAnimateLayout];
  if (_didCapture) {
    [_layoutAnimator capture];
  }
}

- (void)mountingTransactionDidMount:(const MountingTransaction &)transaction
               withSurfaceTelemetry:(const SurfaceTelemetry &)surfaceTelemetry {
  BOOL didCapture = _didCapture;
  _didCapture = NO;

  CGSize size = self.bounds.size;
  BOOL sizeChanged = !CGSizeEqualToSize(size, _reportedSize);

  if (!didCapture) {
    [_layoutAnimator discard];
    if (sizeChanged) {
      _reportedSize = size;
      [self.delegate containerViewLayoutDidChangeAnimated:NO];
    }
    return;
  }

  __weak __typeof(self) weakSelf = self;
  BOOL animated = [_layoutAnimator animateWithSpring:[self.delegate containerViewLayoutSpring]
                                           alongside:^{
                                             [weakSelf.delegate containerViewLayoutDidChangeAnimated:YES];
                                           }];
  if (animated || !sizeChanged) {
    _reportedSize = size;
    return;
  }

  _reportedSize = size;
  [MorphletSpring animateWithSpring:[self.delegate containerViewLayoutSpring]
                           velocity:0
                         animations:^{
                           [weakSelf.delegate containerViewLayoutDidChangeAnimated:YES];
                         }
                         completion:nil];
}

@end

Class<RCTComponentViewProtocol> MorphletContainerViewCls(void) {
  return MorphletContainerView.class;
}

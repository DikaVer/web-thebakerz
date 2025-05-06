/**
 * DOM Monkey Patch to prevent errors caused by Google Translate
 * 
 * This file contains patches for DOM methods that can cause errors when 
 * third-party tools like Google Translate modify the DOM structure.
 * 
 * Common errors this prevents:
 * - "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node."
 * - "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 */

/**
 * This function applies monkey patches to Node.prototype methods to prevent errors
 * when Google Translate or other browser extensions modify the DOM.
 */
export function applyDOMNodePatch() {
  // Skip if not in browser environment
  if (typeof window === 'undefined') return;

  // Don't apply patch more than once
  if ((window as any).__domNodePatchApplied) return;
  
  try {
    // Save original methods
    (window as any).__originalNodePrototype = {
      insertBefore: Node.prototype.insertBefore,
      removeChild: Node.prototype.removeChild
    };
    
    // Patch insertBefore
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function<T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        console.warn('DOM Patch: Prevented insertBefore crash - node is not a child of this parent');
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    // Patch removeChild
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function<T extends Node>(this: Node, child: T): T {
      if (child.parentNode !== this) {
        console.warn('DOM Patch: Prevented removeChild crash - node is not a child of this parent');
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    // Mark as applied
    (window as any).__domNodePatchApplied = true;
    
    console.info('DOM node patch applied successfully');
  } catch (error) {
    console.error('Failed to apply DOM node patch:', error);
  }
}

/**
 * Call this function to remove the patches if needed
 */
export function removeDOMNodePatch() {
  // Skip if not in browser environment
  if (typeof window === 'undefined') return;
  
  // Skip if patch was never applied
  if (!(window as any).__domNodePatchApplied) return;

  try {
    // Restore original methods if they were saved
    const originalProto = (window as any).__originalNodePrototype;
    if (originalProto) {
      if (originalProto.insertBefore) {
        Node.prototype.insertBefore = originalProto.insertBefore;
      }
      if (originalProto.removeChild) {
        Node.prototype.removeChild = originalProto.removeChild;
      }
    }
    
    // Remove flag
    delete (window as any).__domNodePatchApplied;
    
    console.info('DOM node patch removed successfully');
  } catch (error) {
    console.error('Failed to remove DOM node patch:', error);
  }
} 